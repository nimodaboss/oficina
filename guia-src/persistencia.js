(() => {
  "use strict";

  const catalogo = JSON.parse(document.getElementById("catalogo").textContent);
  const documentos = new Map(catalogo.docs.map(doc => [doc.id, doc]));
  const reglas = new Set([
    "CLAUDE.md", "AGENTS.md", "ideas/CLAUDE.md",
    "docs/sesiones-y-catalogo.md", "docs/organizacion-de-oficina.md"
  ]);
  const rutaDeRol = /^catalogo\/roles\/(base|datos|direccion|librarian|research)\/[a-z0-9-]+\.md$/;
  const raices = ["oficina"];
  const activas = new Map();
  const recordadas = new Map();
  const generaciones = new Map();
  const permiso = { mode: "readwrite" };
  const soportado = typeof window.showDirectoryPicker === "function";
  let apertura;

  class ErrorDelManual extends Error {
    constructor(mensaje, code = "archivo") {
      super(mensaje);
      this.code = code;
    }
  }

  function original(doc) {
    // El llamador proporciona una identidad, nunca los tramos que se abren.
    const ficha = documentos.get(doc?.id);
    if (ficha && ficha.root === "oficina" && ficha.id === ficha.path) {
      if (ficha.section !== "roles" && reglas.has(ficha.path)) return ficha;
      if (ficha.section === "roles" && rutaDeRol.test(ficha.path)) return ficha;
    }
    throw new ErrorDelManual("Ese archivo está fuera del catálogo de la guía.");
  }

  function separar(doc, raw) {
    const ficha = original(doc);
    if (ficha.section !== "roles") {
      const prefijo = raw.startsWith("\uFEFF") ? "\uFEFF" : "";
      return { prefijo, cuerpo: raw.slice(prefijo.length) };
    }
    const bloque = /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|(?![\s\S]))/m;
    const encontrado = bloque.exec(raw);
    const nombre = encontrado && /^name:[ \t]*([a-z0-9-]+)[ \t]*\r?$/m.exec(encontrado[1]);
    const esperado = ficha.path.split("/").pop().slice(0, -3);
    if (!encontrado || encontrado.index !== 0 || nombre?.[1] !== esperado) {
      throw new ErrorDelManual("Revisá el encabezado y el nombre del rol en " + ficha.id + ".");
    }
    const prefijo = encontrado[0];
    return { prefijo, cuerpo: raw.slice(prefijo.length) };
  }

  function proponer(doc, base, cuerpo) {
    const anterior = separar(doc, base);
    if (typeof cuerpo !== "string") throw new ErrorDelManual("Falta el texto de la propuesta.");
    const normalizar = texto => texto.replace(/\r\n|\r/g, "\n");
    const nuevo = normalizar(cuerpo);
    if (normalizar(anterior.cuerpo) === nuevo) return base;
    // Un textarea presenta saltos LF también cuando el archivo original usa CRLF.
    const salto = base.match(/\r\n|\r|\n/)?.[0] || "\n";
    let prefijo = anterior.prefijo;
    if (original(doc).section === "roles" && !/[\r\n]$/.test(prefijo)) prefijo += salto;
    return prefijo + nuevo.replace(/\n/g, salto);
  }

  async function archivoDe(carpeta, ficha) {
    const partes = ficha.path.split("/");
    const nombre = partes.pop();
    let ubicacion = carpeta;
    for (const parte of partes) ubicacion = await ubicacion.getDirectoryHandle(parte);
    return ubicacion.getFileHandle(nombre);
  }

  async function contenido(handle) {
    const archivo = await handle.getFile();
    const bytes = await archivo.arrayBuffer();
    try {
      // File.text() descarta el BOM. El prefijo debe sobrevivir byte por byte.
      return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch {
      throw new ErrorDelManual("El archivo contiene texto que no se puede leer como UTF-8.");
    }
  }

  function explicar(error, accion, referencia) {
    if (error instanceof ErrorDelManual) return error;
    const donde = "«" + referencia + "»";
    switch (error?.name) {
      case "AbortError":
        return new ErrorDelManual("Se canceló la operación en " + donde + ".", "cancelado");
      case "NotAllowedError":
      case "SecurityError":
        return new ErrorDelManual("El navegador rechazó el permiso para " + donde +
          ". Volvé a conectar la carpeta en Chrome o Edge.", "permiso");
      case "NotFoundError":
      case "TypeMismatchError":
        return new ErrorDelManual("Falta la ruta esperada " + donde +
          ". Verificá la carpeta elegida y su contenido.");
      case "NoModificationAllowedError":
        return new ErrorDelManual("Otro proceso mantiene abierto " + donde +
          " para escribir. Volvé a revisar el original.", "conflicto");
      default:
        return new ErrorDelManual("No se pudo " + accion + " " + donde +
          ". Comprobá el acceso y volvé a intentarlo.");
    }
  }

  async function validarCarpeta(raiz, carpeta) {
    if (carpeta.kind !== "directory") throw new ErrorDelManual("Elegí la carpeta que contiene guia.html.");
    try {
      await carpeta.getFileHandle("guia.html");
    } catch (error) {
      throw explicar(error, "encontrar", "guia.html");
    }
    for (const ficha of documentos.values()) {
      if (ficha.root !== raiz) continue;
      try {
        const handle = await archivoDe(carpeta, original(ficha));
        separar(ficha, await contenido(handle));
      } catch (error) {
        throw explicar(error, "leer", ficha.id);
      }
    }
  }

  function abrirMemoria() {
    if (!apertura) {
      apertura = new Promise(resolve => {
        try {
          const solicitud = indexedDB.open("guia-portatil-de-oficina", 1);
          solicitud.onupgradeneeded = () => solicitud.result.createObjectStore("carpetas");
          solicitud.onsuccess = () => resolve(solicitud.result);
          solicitud.onerror = solicitud.onblocked = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }
    return apertura;
  }

  async function memoria(raiz, accion, handle) {
    const db = await abrirMemoria();
    if (!db) return null;
    // Las copias de la guía en otras ubicaciones tienen sus propias conexiones.
    const clave = [window.location.pathname, raiz];
    try {
      return await new Promise((resolve, reject) => {
        const transaccion = db.transaction("carpetas", accion === "leer" ? "readonly" : "readwrite");
        const almacen = transaccion.objectStore("carpetas");
        let solicitud;
        if (accion === "leer") solicitud = almacen.get(clave);
        else if (accion === "guardar") solicitud = almacen.put(handle, clave);
        else solicitud = almacen.delete(clave);
        transaccion.oncomplete = () => resolve(solicitud.result);
        transaccion.onabort = transaccion.onerror = () => reject(transaccion.error);
      });
    } catch {
      // Un navegador puede permitir el selector y rechazar la copia del handle en IndexedDB.
      return null;
    }
  }

  async function restaurar() {
    if (!soportado) return;
    await Promise.all(raices.map(async raiz => {
      const generacion = generaciones.get(raiz);
      const carpeta = await memoria(raiz, "leer");
      if (!carpeta || generaciones.get(raiz) !== generacion) return;
      recordadas.set(raiz, carpeta);
      try {
        if (await carpeta.queryPermission(permiso) !== "granted") return;
        await validarCarpeta(raiz, carpeta);
        if (generaciones.get(raiz) === generacion) activas.set(raiz, carpeta);
      } catch {
        if (generaciones.get(raiz) === generacion) {
          recordadas.delete(raiz);
          await memoria(raiz, "quitar");
        }
      }
    }));
  }

  async function conectar(raiz) {
    if (!raices.includes(raiz)) throw new ErrorDelManual("Elegí la carpeta que contiene guia.html.");
    if (!soportado) throw new ErrorDelManual("Para escribir en el original, abrí la guía en Chrome o Edge.");
    const generacion = (generaciones.get(raiz) || 0) + 1;
    generaciones.set(raiz, generacion);
    const previa = activas.get(raiz);
    const pendiente = !previa && recordadas.get(raiz);
    try {
      // El selector o el pedido de permiso se abre dentro del gesto de la persona.
      const carpeta = pendiente || await window.showDirectoryPicker({ mode: "readwrite", id: "guia-" + raiz });
      let estado = pendiente ? await carpeta.requestPermission(permiso) : await carpeta.queryPermission(permiso);
      if (!pendiente && estado === "prompt") estado = await carpeta.requestPermission(permiso);
      if (estado !== "granted") {
        throw new ErrorDelManual("El navegador no concedió acceso de escritura a «" + raiz +
          "». Volvé a conectar la carpeta.", "permiso");
      }
      await validarCarpeta(raiz, carpeta);
      let cambioDeDestino = false;
      if (previa) {
        try {
          cambioDeDestino = !await previa.isSameEntry(carpeta);
        } catch {
          // Un borrador revisado solo se puede reutilizar con identidad comprobada.
          cambioDeDestino = true;
        }
      }
      if (generaciones.get(raiz) !== generacion) throw new ErrorDelManual("Hay otra conexión en curso.");
      activas.set(raiz, carpeta);
      recordadas.set(raiz, carpeta);
      await memoria(raiz, "guardar", carpeta);
      return { cambioDeDestino };
    } catch (error) {
      if (pendiente && generaciones.get(raiz) === generacion) {
        recordadas.delete(raiz);
        await memoria(raiz, "quitar");
      }
      throw explicar(error, "conectar", raiz);
    }
  }

  async function leer(doc) {
    const ficha = original(doc);
    const carpeta = activas.get(ficha.root);
    if (!carpeta) return ficha.raw;
    try {
      const raw = await contenido(await archivoDe(carpeta, ficha));
      separar(ficha, raw);
      return raw;
    } catch (error) {
      throw explicar(error, "leer", ficha.id);
    }
  }

  async function guardar(doc, base, cuerpo) {
    const ficha = original(doc);
    const carpeta = activas.get(ficha.root);
    if (!carpeta) throw new ErrorDelManual("Conectá la carpeta «" + ficha.root + "» antes de guardar.");
    const propuesta = proponer(ficha, base, cuerpo);
    const conflicto = () => new ErrorDelManual("El original cambió en disco. " +
      "Compará la versión actual antes de volver a guardar.", "conflicto");
    let escritura;
    let cerrado = false;
    try {
      if (await carpeta.queryPermission(permiso) !== "granted") {
        throw new ErrorDelManual("Se perdió el permiso de escritura. Volvé a conectar la carpeta.", "permiso");
      }
      const handle = await archivoDe(carpeta, ficha);
      async function comprobarBase() {
        const actual = await archivoDe(carpeta, ficha);
        if (activas.get(ficha.root) !== carpeta || !await actual.isSameEntry(handle) ||
            await contenido(actual) !== base) throw conflicto();
      }
      await comprobarBase();
      escritura = await handle.createWritable({ mode: "exclusive" });
      // La API prepara un archivo temporal hasta close(). Si el original cambió,
      // abort descarta ese temporal sin reemplazar el contenido nuevo de disco.
      await escritura.write(propuesta);
      await comprobarBase();
      await escritura.close();
      cerrado = true;
      const escrito = await contenido(await archivoDe(carpeta, ficha));
      if (escrito !== propuesta) throw new ErrorDelManual("El archivo leído después de cerrar difiere de " +
        "la propuesta. Revisá el original.", "conflicto");
      return escrito;
    } catch (error) {
      if (escritura && !cerrado) {
        try { await escritura.abort(); } catch { /* El navegador ya cerró el flujo. */ }
      }
      if (cerrado && !(error instanceof ErrorDelManual)) {
        throw new ErrorDelManual("La escritura se cerró, pero no se pudo verificar el archivo. " +
          "Revisá el original.");
      }
      if (error?.name === "NotFoundError") throw conflicto();
      throw explicar(error, "guardar", ficha.id);
    }
  }

  window.archivos = Object.freeze({
    soportado, conectado: raiz => activas.has(raiz), nombre: raiz => activas.get(raiz)?.name, restaurar, conectar,
    leer, separar, proponer, guardar
  });
})();
