(() => {
  "use strict";

  const {docs, teams, links} = JSON.parse(document.getElementById("catalogo").textContent);
  const files = window.archivos;
  const $ = id => document.getElementById(id);
  const titles = {instrucciones:"Instrucciones", roles:"Roles", carpetas:"Carpetas"};
  const byId = new Map(docs.map(doc => [doc.id, doc]));
  const live = new Map();
  const unavailable = new Map();
  const drafts = new Map();
  const lastSelection = {};
  const localMaps = new Set(links);
  let section = "instrucciones";
  let current;
  let mode = "lectura";
  let busy = false;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, fn, className, id) {
    const node = element("button", text, className);
    node.type = "button";
    if (id) node.id = id;
    node.addEventListener("click", fn);
    return node;
  }
  function fold(text) {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
  }
  function cleanLines(text) {
    return text.replace(/\r\n?/g, "\n");
  }
  function rawOf(doc) {
    return live.get(doc.id) ?? doc.raw;
  }
  function descriptionOf(doc) {
    if (doc.section !== "roles" || !live.has(doc.id)) return doc.description;
    const {prefijo} = files.separar(doc, rawOf(doc));
    const found = /^description:[ \t]*(.*)$/m.exec(prefijo);
    if (!found) return "";
    const plain = found[1].trim();
    if (plain.startsWith('"') && plain.endsWith('"')) {
      try { return JSON.parse(plain); } catch {}
    }
    if (plain.startsWith("'") && plain.endsWith("'")) return plain.slice(1,-1).replaceAll("''", "'");
    return plain;
  }
  function titleOf(doc) {
    if (doc.section === "roles" || !live.has(doc.id)) return doc.title;
    const heading = /^#[ \t]+(.+)$/m.exec(rawOf(doc).replace(/^\uFEFF/, ""));
    return heading ? heading[1].trim() : doc.path;
  }
  function inSection(key) {
    return docs.filter(doc => doc.section === key || (key === "instrucciones" && doc.section === "carpetas"));
  }
  function message(text = "", error = false) {
    $("aviso").dataset.tipo = error ? "error" : "info";
    $("aviso").textContent = text;
  }
  function toggleIndex(open, focusSearch = false) {
    $("indice").classList.toggle("abierto", open);
    $("indice-movil").setAttribute("aria-expanded", String(open));
    $("indice-movil").textContent = open ? "Cerrar índice" : "Abrir índice";
    if (open && focusSearch) $("buscar").focus();
  }
  function goTo(doc, focus = true) {
    if (busy) return;
    current = doc;
    lastSelection[section] = doc.id;
    mode = "lectura";
    message();
    renderIndex();
    renderReader();
    toggleIndex(false);
    if (focus) $("documento-titulo").focus();
  }
  function filtered() {
    const words = fold($("buscar").value.trim()).split(/\s+/).filter(Boolean);
    const team = section === "roles" && $("equipo").value;
    return inSection(section).filter(doc => {
      if (team && team !== doc.team) return false;
      const haystack = fold([doc.title, titleOf(doc), descriptionOf(doc), doc.id, rawOf(doc)].join(" "));
      return words.every(word => haystack.includes(word));
    });
  }
  function renderIndex(chooseResult = false) {
    const candidates = filtered();
    if (chooseResult && !candidates.includes(current)) {
      current = candidates[0];
      mode = "lectura";
      message();
    }
    $("lista").replaceChildren();
    $("filtro").hidden = section !== "roles";
    const noun = section === "roles" ? "ficha" : "documento";
    $("resultados").textContent = candidates.length + " " + noun + (candidates.length === 1 ? "" : "s");
    const grouped = section === "roles"
      ? Object.entries(teams).map(([key, name]) => [name, candidates.filter(doc => doc.team === key)])
      : [[null, candidates]];
    for (const [name, entries] of grouped) {
      if (!entries.length) continue;
      if (name) {
        const heading = element("h3", name + " ", "group-title");
        heading.append(element("span", String(entries.length)));
        $("lista").append(heading);
      }
      for (const doc of entries) {
        const link = button(titleOf(doc), () => goTo(doc), "doc-link");
        link.dataset.docId = doc.id;
        link.setAttribute("aria-current", String(doc === current));
        if (doc.section !== "roles") link.append(element("small", doc.path));
        $("lista").append(link);
      }
    }
  }
  function selectSection(key, selected) {
    if (busy) return;
    section = key;
    $("buscar").value = "";
    $("equipo").value = "";
    $("movil-seccion").textContent = titles[key];
    for (const tab of document.querySelectorAll("[data-section]")) {
      if (tab.dataset.section === key) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    }
    const entries = inSection(key);
    goTo(selected || entries.find(doc => doc.id === lastSelection[key]) || entries[0], false);
  }
  function resolveLink(path, doc) {
    if (!path || /^[#/\\]|[\u0000-\u001f]|^[a-z][a-z0-9+.-]*:/i.test(path)) return null;
    const parts = doc.id.split("/").slice(0,-1);
    for (const part of path.split(/[?#]/)[0].split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") {
        if (!parts.length) return null;
        parts.pop();
      }
      else parts.push(part);
    }
    return parts.join("/");
  }
  // El Markdown se interpreta en nodos de texto; los destinos nunca se copian a href.
  function inline(container, text, doc) {
    const pattern = /`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\n]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
    let previous = 0;
    for (const match of text.matchAll(pattern)) {
      container.append(text.slice(previous, match.index));
      if (match[1]) container.append(element("code", match[1]));
      else if (match[2]) {
        const id = resolveLink(match[3], doc);
        if (byId.has(id)) {
          const target = byId.get(id);
          const link = button(match[2], () => {
            selectSection(target.section, target);
            $("documento-titulo").focus();
          }, "inline-link");
          container.append(link);
        } else if (localMaps.has(id)) {
          const link = element("a", match[2]);
          link.href = id;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          container.append(link);
        } else {
          container.append(match[2], element("span", " (" + match[3] + ")", "source-link"));
        }
      } else container.append(element(match[4] ? "strong" : "em", match[4] || match[5]));
      previous = match.index + match[0].length;
    }
    container.append(text.slice(previous));
  }
  function renderMarkdown(doc, body) {
    const root = document.createDocumentFragment();
    const lines = cleanLines(body.replace(/^\uFEFF/,"")).split("\n");
    let paragraph = [], list = null, i = 0;
    const flush = () => {
      if (paragraph.length) {
        const p = element("p");
        inline(p, paragraph.join(" "), doc);
        root.append(p);
        paragraph = [];
      }
    };
    while (i < lines.length) {
      const line = lines[i++], trimmed = line.trim();
      const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
      const item = /^(\d+[.)]|[-*])\s+(.+)$/.exec(trimmed);
      if (!trimmed) { flush(); list = null; continue; }
      if (/^```/.test(trimmed)) {
        flush(); list = null;
        const code = [];
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        if (i < lines.length) i++;
        root.append(element("pre", code.join("\n")));
      } else if (heading) {
        flush(); list = null;
        if (heading[1] === "#" && !root.childNodes.length && titleOf(doc) === heading[2].trim()) continue;
        const h = element("h" + Math.min(6,Math.max(3,heading[1].length + 1)));
        inline(h, heading[2], doc);
        root.append(h);
      } else if (trimmed.startsWith("|") && /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[i] || "")) {
        flush(); list = null; i++;
        const wrap = element("div", undefined, "table-wrap"), table = element("table");
        const addRow = (source, header, target) => {
          const row = element("tr");
          for (const val of source.trim().replace(/^\||\|$/g, "").split("|")) {
            const cell = element(header ? "th" : "td");
            if (header) cell.scope = "col";
            inline(cell, val.trim(), doc);
            row.append(cell);
          }
          target.append(row);
        };
        addRow(trimmed,true,table.createTHead());
        const tbody = table.createTBody();
        while (i < lines.length && /^\s*\|/.test(lines[i])) addRow(lines[i++],false,tbody);
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "Tabla de " + (table.rows[0]?.cells[0]?.textContent || "referencia"));
        wrap.append(table); root.append(wrap);
      } else if (item) {
        flush();
        const tag = /^\d/.test(item[1]) ? "ol" : "ul";
        if (!list || list.localName !== tag) {
          list = element(tag);
          if (tag === "ol") list.start = Number.parseInt(item[1], 10);
          root.append(list);
        }
        const li = element("li");
        inline(li, item[2], doc);
        list.append(li);
      } else if (trimmed.startsWith(">")) {
        flush(); list = null;
        const quote = element("blockquote");
        inline(quote, trimmed.replace(/^>\s?/, ""), doc);
        root.append(quote);
      } else if (list && /^\s+/.test(line)) {
        list.lastElementChild.append(" ");
        inline(list.lastElementChild, trimmed, doc);
      } else {
        list = null; paragraph.push(trimmed);
      }
    }
    flush();
    return root;
  }

  function renderReader() {
    const doc = current;
    $("cabecera").hidden = !doc;
    $("vacio").hidden = Boolean(doc);
    $("contenido").hidden = !doc || (mode !== "lectura" && mode !== "fuente");
    $("trabajo").hidden = !doc || !$("contenido").hidden;
    if (!doc) return;
    const onDisk = files.conectado(doc.root) && live.has(doc.id) && !unavailable.has(doc.id);
    $("origen").dataset.disco = String(onDisk);
    $("origen").textContent = onDisk ? "Vinculado al disco" : "Copia de consulta";
    $("contexto").textContent = section === "roles" ? "Equipo " + teams[doc.team] : titles[section];
    $("documento-titulo").textContent = titleOf(doc);
    $("ruta").textContent = doc.path;
    $("descripcion").hidden = doc.section !== "roles";
    $("descripcion").textContent = doc.section === "roles" ? descriptionOf(doc) : "";
    $("conectar").hidden = !files.soportado || mode === "revision" || mode === "edicion";
    $("conectar").textContent = onDisk ? "Volver a vincular carpeta" : "Vincular carpeta";
    $("editar").hidden = !["lectura","fuente"].includes(mode);
    $("editar").textContent = drafts.has(doc.id) ? "Retomar borrador" : files.soportado ? "Editar original" : "Preparar copia";
    $("editar").disabled = Boolean(files.soportado && !onDisk && !drafts.has(doc.id));
    $("fuente").hidden = $("editar").hidden;
    $("fuente").setAttribute("aria-pressed",String(mode === "fuente"));
    $("fuente").textContent = mode === "fuente" ? "Volver a lectura" : "Ver fuente";
    if (!$("contenido").hidden) {
      const raw = rawOf(doc);
      if (mode === "fuente") $("contenido").replaceChildren(element("pre",raw));
      else $("contenido").replaceChildren(renderMarkdown(doc, files.separar(doc,raw).cuerpo));
      if (unavailable.has(doc.id)) message(unavailable.get(doc.id), true);
      else if (!files.soportado && !$("aviso").textContent)
        message("Este navegador permite descargar una copia editada. Para guardar en el original, abrí la guía en Chrome o Edge de escritorio y vinculá su carpeta.");
    } else if (mode === "edicion") renderEditor();
    else renderReview();
  }
  function freeze(value, announcement) {
    busy = value;
    document.querySelector(".sectionbar").inert = value;
    $("indice").inert = value;
    $("indice-movil").disabled = value;
    $("lector").setAttribute("aria-busy",String(value));
    $("cabecera").inert = value;
    $("trabajo").inert = value;
    if (announcement) message(announcement);
  }
  async function loadRoot(root) {
    for (const doc of docs.filter(item => item.root === root)) {
      try {
        const raw = await files.leer(doc);
        files.separar(doc,raw);
        live.set(doc.id,raw);
        unavailable.delete(doc.id);
      } catch (err) {
        live.delete(doc.id);
        unavailable.set(doc.id, "Lectura desde el disco pendiente. Se muestra la copia de consulta. " + err.message);
      }
    }
  }
  async function connect() {
    if (!current || busy) return;
    const root = current.root;
    freeze(true, "Elegí en el navegador la carpeta que contiene guia.html.");
    try {
      const connection = await files.conectar(root);
      if (connection.cambioDeDestino) {
        for (const [id, draft] of drafts) {
          if (byId.get(id).root === root) draft.newDestination = true;
        }
      }
      await loadRoot(root);
      renderIndex(); renderReader();
      if (!unavailable.has(current.id)) message("Carpeta «" + files.nombre(root) + "» vinculada. Se volvió a leer el contenido del disco.");
    } catch (err) {
      renderReader();
      message(err.message, true);
    } finally { freeze(false); }
  }
  async function startEditing() {
    if (!current || busy) return;
    const doc = current;
    freeze(true);
    try {
      const old = drafts.get(doc.id);
      const raw = await files.leer(doc);
      if (files.conectado(doc.root)) {
        live.set(doc.id, raw);
        unavailable.delete(doc.id);
      }
      if (old && old.base !== raw && files.conectado(doc.root)) old.conflict = true;
      if (!old) drafts.set(doc.id, {base:raw, body:files.separar(doc,raw).cuerpo, conflict:false});
      mode = "edicion";
      message();
      renderReader();
    } catch (err) { message(err.message, true); }
    finally { freeze(false); }
    if (mode === "edicion") $("borrador").focus();
  }
  function leaveDraft() {
    const draft = drafts.get(current.id);
    const changed = files.proponer(current,draft.base,draft.body) !== draft.base;
    if (!changed) drafts.delete(current.id);
    mode = "lectura";
    message(changed ? "Tu borrador sigue disponible en esta pestaña. Elegí «Retomar borrador» para continuar." : "");
    renderReader(); $("documento-titulo").focus();
  }
  function download(doc, draft) {
    const full = files.proponer(doc,draft.base,draft.body);
    const url = URL.createObjectURL(new Blob([full],{type:"text/markdown;charset=utf-8"}));
    const link = element("a");
    link.href = url;
    link.download = doc.path.split("/").at(-1).replace(/\.md$/i,"-copia.md");
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    message("Se solicitó la descarga de la copia. El original sigue en el disco.");
  }
  function details(label, body) {
    const box = element("details",undefined,"original");
    box.append(element("summary",label),element("pre",body));
    return box;
  }
  function renderEditor() {
    const doc = current, draft = drafts.get(doc.id);
    const role = doc.section === "roles";
    const work = $("trabajo"), connected = files.conectado(doc.root);
    const title = element("h3",role ? "Editar cuerpo del rol" : "Editar Markdown");
    const info = element("p", role
      ? "El nombre, la descripción y los metadatos de integración se conservan en la cabecera de la ficha."
      : "La revisión muestra el texto que cambiará en este documento.");
    const field = element("label", "Tu borrador");
    field.htmlFor = "borrador";
    const area = element("textarea");
    area.id = "borrador"; area.value = draft.body; area.spellcheck = false;
    const original = files.separar(doc,draft.base).cuerpo;
    const actions = element("div",undefined,"actions");
    const review = button("Revisar cambios", () => {
      mode = "revision"; message(); renderReader(); $("revision-titulo").focus();
    },"btn primary","revisar");
    const updateReview = () => {
      review.disabled = draft.newDestination || draft.conflict || cleanLines(original) === cleanLines(draft.body);
    };
    area.addEventListener("input", () => { draft.body = area.value; updateReview(); });
    updateReview();
    field.append(area);
    actions.append(review,button("Descargar copia",() => download(doc,draft),"btn","descargar"),
      button("Volver a lectura",leaveDraft,"btn"));
    work.replaceChildren(title,info,details("Ver original al iniciar la edición",original),field,actions);
    if (!connected) message("Estás preparando una copia descargable. El Markdown original se conserva en su carpeta.");
    if (draft.newDestination) {
      message("Cambió la carpeta de destino. Tu borrador viene de otra copia. Verificá la ruta " + doc.path +
        " dentro de «" + files.nombre(doc.root) + "».",true);
      work.append(button("Revisar destino y comparar con el disco",rebase,"btn","comparar-actual"));
    } else if (draft.conflict) {
      message("Conflicto de edición. El original cambió en el disco. Tu borrador sigue disponible abajo.",true);
      work.append(button("Comparar con el original actual",rebase,"btn","comparar-actual"));
    }
  }
  async function rebase() {
    if (busy) return;
    const doc = current, draft = drafts.get(doc.id);
    freeze(true);
    try {
      if (!files.conectado(doc.root)) throw new Error("Volvé a lectura y vinculá la carpeta para leer el original actual.");
      const fresh = await files.leer(doc);
      live.set(doc.id,fresh);
      const newDestination = draft.newDestination;
      draft.base = fresh;
      draft.newDestination = false;
      draft.conflict = false;
      mode = "revision";
      renderReader();
      message(newDestination
        ? "Revisá la propuesta para " + doc.path + " en la nueva carpeta «" + files.nombre(doc.root) + "». Confirmar guardará allí."
        : "Comparación con la última versión del disco. Revisá todas las diferencias antes de confirmar.");
    } catch (err) { message(err.message,true); }
    finally { freeze(false); }
    if (mode === "revision") $("revision-titulo").focus();
  }
  // Se omiten los bloques idénticos al comienzo y al final. Lo intermedio se muestra completo.
  function differences(a,b) {
    const left = cleanLines(a).split("\n"), right = cleanLines(b).split("\n");
    let start = 0, endA = left.length, endB = right.length;
    while (start < endA && start < endB && left[start] === right[start]) start++;
    while (endA > start && endB > start && left[endA-1] === right[endB-1]) { endA--; endB--; }
    return [left.slice(start,endA), right.slice(start,endB)];
  }
  function renderReview() {
    const doc = current, draft = drafts.get(doc.id);
    const whole = files.proponer(doc,draft.base,draft.body);
    const original = files.separar(doc,draft.base).cuerpo, proposed = files.separar(doc,whole).cuerpo;
    const title = element("h3","Revisar cambios");
    title.id = "revision-titulo"; title.tabIndex = -1;
    const connected = files.conectado(doc.root);
    const impact = element("p", !connected ? "La descarga crea una copia del Markdown en tu equipo."
      : doc.section === "roles" ? "Guardar modifica el cuerpo de esta ficha compartida por Claude y Codex."
      : "Guardar actualiza las instrucciones de este archivo para las sesiones que lo lean.");
    const path = element("code", connected ? files.nombre(doc.root) + "/" + doc.path : doc.path, "path");
    const changes = element("div",undefined,"compare");
    const [removed,added] = differences(original,proposed);
    for (const [label,rows,cls] of [["Original",removed,"del"],["Propuesta",added,"add"]]) {
      const side = element("div");
      side.append(element("h4",label),element("pre",rows.length ? rows.join("\n") : "Sin líneas en este tramo.",cls));
      changes.append(side);
    }
    const actions = element("div",undefined,"actions");
    if (connected) {
      const save = button("Confirmar guardado",commit,"btn primary","confirmar");
      save.disabled = draft.newDestination || draft.conflict || whole === draft.base;
      actions.append(save);
    }
    actions.append(button("Volver al borrador",() => { mode = "edicion"; message(); renderReader(); $("borrador").focus(); },"btn","volver-editor"),
      button("Descargar copia",() => download(doc,draft),"btn","descargar"));
    $("trabajo").replaceChildren(title,path,impact,changes,details("Ver propuesta completa",whole),actions);
  }
  async function commit() {
    if (busy || mode !== "revision" || !current) return;
    const doc = current, draft = drafts.get(doc.id);
    if (!draft || draft.newDestination || draft.conflict || !files.conectado(doc.root)) return;
    freeze(true,"Comprobando el archivo en el disco…");
    try {
      const stored = await files.guardar(doc,draft.base,draft.body);
      live.set(doc.id,stored);
      drafts.delete(doc.id);
      unavailable.delete(doc.id);
      mode = "lectura";
      renderIndex(); renderReader();
      message("Guardado y verificado en el disco. " + doc.id);
    } catch (err) {
      if (err.code === "conflicto") draft.conflict = true;
      mode = "edicion"; renderReader();
      message((draft.conflict ? "Conflicto de edición. " : "") + err.message + " Tu borrador se conserva.",true);
    } finally { freeze(false); }
    if (mode === "lectura") $("documento-titulo").focus(); else $("borrador").focus();
  }
  for (const tab of document.querySelectorAll("[data-section]")) {
    tab.querySelector("small").textContent = String(inSection(tab.dataset.section).length);
    tab.addEventListener("click",() => selectSection(tab.dataset.section));
  }
  for (const [key,name] of Object.entries(teams)) {
    const option = element("option",name);
    option.value = key;
    $("equipo").append(option);
  }
  $("indice-movil").addEventListener("click",() => toggleIndex(!$("indice").classList.contains("abierto"),true));
  for (const [id,event] of [["buscar","input"],["equipo","change"]]) {
    $(id).addEventListener(event,() => { renderIndex(true); renderReader(); });
  }
  $("fuente").addEventListener("click",() => {
    mode = mode === "fuente" ? "lectura" : "fuente"; message(); renderReader();
  });
  $("conectar").addEventListener("click",connect);
  $("editar").addEventListener("click",startEditing);
  window.addEventListener("beforeunload",event => {
    if ([...drafts.entries()].some(([id,draft]) =>
      cleanLines(files.separar(byId.get(id),draft.base).cuerpo) !== cleanLines(draft.body))) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  selectSection("instrucciones");
  if (files.soportado) (async () => {
    freeze(true);
    try {
      await files.restaurar();
      for (const root of new Set(docs.map(doc => doc.root))) if (files.conectado(root)) await loadRoot(root);
      renderIndex(); renderReader();
    } catch (err) { message(err.message || "Para editar, vinculá de nuevo la carpeta del documento.",true); }
    finally { freeze(false); }
  })();
})();
