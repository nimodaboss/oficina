"""Genera o comprueba la edición local del manual usando los originales en disco."""

import argparse
import json
import os
from pathlib import Path
import re
import tempfile


OFICINA = Path(__file__).resolve().parents[1]
FUENTE = OFICINA / "guia-src"
ENTREGA = OFICINA / "guia.html"

# La guía solo incorpora estos textos del método y las fichas enumeradas debajo.
REGLAS = (
    ("CLAUDE.md", "instrucciones"),
    ("AGENTS.md", "instrucciones"),
    ("ideas/CLAUDE.md", "instrucciones"),
    ("docs/sesiones-y-catalogo.md", "instrucciones"),
    ("docs/organizacion-de-oficina.md", "carpetas"),
)
EQUIPOS_POR_CLAVE = {
    "base": "Base",
    "datos": "Datos",
    "direccion": "Dirección",
    "librarian": "Librarian",
    "research": "Research",
}
ROLES_POR_EQUIPO = {
    "base": {"apps-script", "corrector", "implementador", "investigador", "mecanico", "revisor"},
    "datos": {"analista", "dataviz", "extractor-gdm", "tablero-html"},
    "direccion": {"arquitecto", "disenador", "estratega", "pm"},
    "librarian": {"librarian"},
    "research": {"esceptico", "explorador", "practico"},
}


# Destinos de consulta locales que el lector puede abrir desde el Markdown.
ENLACES_LOCALES = (
    "README.md",
    "ejemplos/contexto-inicial.md",
    "ejemplos/primera-idea/LEEME.md",
    "ejemplos/primera-idea/ESTADO.md",
    "ejemplos/primera-idea/docs/planificacion/plan.md",
    "ejemplos/primera-idea/tarjetas/IDEA-1.md",
    *[f"catalogo/skills/{nombre}/SKILL.md" for nombre in (
        "equipo-base", "equipo-datos", "equipo-direccion", "equipo-librarian",
        "equipo-research", "idea-nueva", "revisar-skills", "turno",
    )],
)


def leer(ruta):
    # read_text normaliza CRLF. El editor necesita el mismo Markdown que en disco.
    if not ruta.resolve(strict=True).is_relative_to(OFICINA):
        raise ValueError(f"La fuente queda fuera de la carpeta de Oficina: {ruta.name}")
    return ruta.read_bytes().decode("utf-8")


def campo(cabecera, nombre):
    linea = re.search(rf"^{nombre}:[ \t]*(.+)$", cabecera, re.MULTILINE)
    if not linea:
        raise ValueError(f"Falta {nombre} en el frontmatter.")
    valor = linea[1].strip()
    if valor.startswith('"'):
        return json.loads(valor)
    if valor.startswith("'") and valor.endswith("'"):
        return valor[1:-1].replace("''", "'")
    return valor


def ficha(ruta, seccion, equipo=""):
    raw = leer(OFICINA / ruta)
    descripcion = ""
    if seccion == "roles":
        cabecera = re.match(r"\A\ufeff?---\r?\n(.*?)\r?\n---(?:\r?\n|$)", raw, re.DOTALL)
        if not cabecera:
            raise ValueError(f"Frontmatter ilegible en {ruta}")
        titulo = campo(cabecera[1], "name")
        descripcion = campo(cabecera[1], "description")
        if titulo != Path(ruta).stem or not descripcion:
            raise ValueError(f"Nombre o descripción inesperados en {ruta}")
    else:
        encabezado = re.search(r"^\ufeff?# (.+)$", raw, re.MULTILINE)
        titulo = encabezado[1].strip() if encabezado else ruta
    return dict(id=ruta, root="oficina", path=ruta, section=seccion,
                team=equipo, title=titulo, description=descripcion, raw=raw)


def catalogo():
    docs = [ficha(ruta, seccion) for ruta, seccion in REGLAS]
    for equipo, roles in ROLES_POR_EQUIPO.items():
        for nombre in sorted(roles):
            docs.append(ficha(f"catalogo/roles/{equipo}/{nombre}.md", "roles", equipo))
    return {"docs": docs, "teams": EQUIPOS_POR_CLAVE, "links": ENLACES_LOCALES}


def renderizar():
    # Un '</script>' del Markdown no debe cerrar el bloque JSON del documento.
    datos = json.dumps(catalogo(), ensure_ascii=False, separators=(",", ":"))
    valores = {
        "CATALOGO": datos.replace("<", r"\u003c"),
        "PERSISTENCIA": leer(FUENTE / "persistencia.js"),
        "INTERFAZ": leer(FUENTE / "interfaz.js"),
    }
    for clave in ("PERSISTENCIA", "INTERFAZ"):
        if re.search(r"</script\b", valores[clave], re.IGNORECASE):
            raise ValueError(f"El código de {clave} contiene un cierre de script HTML.")
    plantilla = leer(FUENTE / "manual.html")
    patron = r"@@(CATALOGO|PERSISTENCIA|INTERFAZ)@@"
    if sorted(re.findall(patron, plantilla)) != sorted(valores):
        raise ValueError("La plantilla debe incluir una vez cada marcador de contenido.")
    return re.sub(patron, lambda m: valores[m[1]], plantilla).encode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--comprobar", action="store_true",
                        help="Compara toda la entrega con las fuentes, sin escribir archivos.")
    args = parser.parse_args()
    contenido = renderizar()
    if ENTREGA.is_file() and ENTREGA.read_bytes() == contenido:
        print(f"Coinciden las fuentes y la entrega. 18 roles, 5 equipos y 5 documentos de Oficina. {ENTREGA.name}")
        return
    if args.comprobar:
        parser.exit(1, "La entrega falta o difiere de las fuentes actuales.\n")
    ENTREGA.parent.mkdir(exist_ok=True)
    # Reemplazo al final de la escritura para que una regeneración no trunque la entrega.
    with tempfile.NamedTemporaryFile(dir=ENTREGA.parent, suffix=".tmp", delete=False) as temporal:
        temporal.write(contenido)
    os.replace(temporal.name, ENTREGA)
    print(f"Generada {ENTREGA.name}. 18 roles, 5 equipos y 5 documentos de Oficina.")


if __name__ == "__main__":
    main()
