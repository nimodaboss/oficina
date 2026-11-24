"""Prepara el catálogo y el primer ejemplo dentro de este clon de Oficina."""

import argparse
from dataclasses import dataclass
import json
import os
from pathlib import Path
import re
import stat
import sys
import tempfile


RAIZ = Path(__file__).resolve().parents[1]
ROLES = {
    "base": ("apps-script", "corrector", "implementador", "investigador", "mecanico", "revisor"),
    "datos": ("analista", "dataviz", "extractor-gdm", "tablero-html"),
    "direccion": ("arquitecto", "disenador", "estratega", "pm"),
    "librarian": ("librarian",),
    "research": ("esceptico", "explorador", "practico"),
}
SKILLS_INCLUIDAS = {
    "equipo-base", "equipo-datos", "equipo-direccion", "equipo-librarian",
    "equipo-research", "idea-nueva", "revisar-skills", "turno",
}
ARCHIVOS_IDEA = ("ESTADO.md", "tarjetas/IDEA-1.md", "docs/planificacion/plan.md", "LEEME.md")


class Conflicto(ValueError):
    """Hace falta revisar un archivo antes de continuar."""


def tipo(ruta):
    try:
        datos = ruta.lstat()
    except FileNotFoundError:
        return "ausente"
    if stat.S_ISLNK(datos.st_mode) or getattr(datos, "st_file_attributes", 0) & 0x400:
        return "enlace"
    if stat.S_ISREG(datos.st_mode):
        return "archivo"
    if stat.S_ISDIR(datos.st_mode):
        return "carpeta"
    return "especial"


def padre_seguro(ruta, crear=False):
    """Cada directorio intermedio debe pertenecer físicamente al clon."""
    padre = RAIZ
    for parte in ruta.parent.relative_to(RAIZ).parts:
        padre = padre / parte
        estado = tipo(padre)
        if estado == "ausente":
            if not crear:
                return
            padre.mkdir(exist_ok=True)
            estado = tipo(padre)
        if estado != "carpeta":
            raise Conflicto(f"Se esperaba un directorio local en {padre.relative_to(RAIZ)}.")


def verificar_arbol(carpeta):
    """Un paquete opcional puede contener recursos; todos deben estar dentro del clon."""
    padre_seguro(carpeta)
    if tipo(carpeta) != "carpeta":
        raise Conflicto(f"Se esperaba el directorio {carpeta.relative_to(RAIZ)}.")
    for entrada in carpeta.iterdir():
        estado = tipo(entrada)
        if estado == "carpeta":
            verificar_arbol(entrada)
        elif estado != "archivo":
            raise Conflicto(f"Revisá la entrada {entrada.relative_to(RAIZ)} ({estado}).")


def descripcion(ficha, nombre):
    if tipo(ficha) != "archivo":
        raise Conflicto(f"Falta la ficha {ficha.relative_to(RAIZ)}.")
    lineas = ficha.read_text(encoding="utf-8-sig").splitlines()
    if not lineas or lineas[0] != "---" or "---" not in lineas[1:]:
        raise Conflicto(f"Revisá la cabecera de {ficha.relative_to(RAIZ)}.")
    campos = {}
    for linea in lineas[1:lineas.index("---", 1)]:
        clave, separador, valor = linea.partition(":")
        if separador and clave in {"name", "description"}:
            valor = valor.strip()
            if clave in campos or not valor or valor in {"|", ">", "|-", ">-"}:
                raise Conflicto(f"Escribí {clave} una sola vez y en una línea en {ficha.relative_to(RAIZ)}.")
            if valor.startswith('"'):
                valor = json.loads(valor)
            elif valor.startswith("'") and valor.endswith("'"):
                valor = valor[1:-1].replace("''", "'")
            campos[clave] = valor
    if campos.get("name") != nombre or not campos.get("description"):
        raise Conflicto(f"Revisá name y description en {ficha.relative_to(RAIZ)}.")
    return campos["description"]


@dataclass
class Entrada:
    destino: Path
    clase: str
    fuente: Path
    contenido: bytes = b""

    def pendiente(self):
        padre_seguro(self.destino)
        estado = tipo(self.destino)
        if estado == "ausente":
            return True
        if self.clase == "enlace" and estado == "enlace":
            # Comparar el destino declarado sin recorrer un enlace ajeno.
            bruto = os.readlink(self.destino)
            if os.name == "nt" and bruto.startswith("\\\\?\\UNC\\"):
                bruto = "\\\\" + bruto[8:]
            elif os.name == "nt" and bruto.startswith("\\\\?\\"):
                bruto = bruto[4:]
            relativo = Path(os.path.relpath(self.fuente, self.destino.parent))
            if Path(bruto) in (self.fuente, relativo):
                return False
        if estado == "archivo":
            if self.clase == "ejemplo":
                return False  # El archivo de trabajo pertenece a quien usa esta Oficina.
            if self.clase == "descriptor" and self.destino.read_bytes() == self.contenido:
                return False
        raise Conflicto(f"Destino ocupado o diferente: {self.destino.relative_to(RAIZ)}. "
                        "Revisá su contenido antes de volver a ejecutar.")

    def crear(self):
        padre_seguro(self.destino, crear=True)
        if self.clase == "enlace":
            if os.name == "nt":
                # Las junctions de directorio de Windows funcionan sin modo desarrollador.
                import _winapi
                _winapi.CreateJunction(str(self.fuente), str(self.destino))
            else:
                relativo = os.path.relpath(self.fuente, self.destino.parent)
                self.destino.symlink_to(relativo, target_is_directory=True)
            return
        # Publicación exclusiva. Un corte deja el original o un archivo completo.
        archivo = tempfile.NamedTemporaryFile(dir=self.destino.parent, delete=False)
        temporal = Path(archivo.name)
        try:
            with archivo:
                archivo.write(self.contenido)
            if os.name == "nt":
                os.rename(temporal, self.destino)  # En Windows falla si ya existe.
            else:
                os.link(temporal, self.destino)
        finally:
            temporal.unlink(missing_ok=True)


def plan():
    raiz_roles = RAIZ / "catalogo/roles"
    raiz_skills = RAIZ / "catalogo/skills"
    verificar_arbol(raiz_roles)
    verificar_arbol(raiz_skills)
    entradas = [
        Entrada(RAIZ / ".claude/agents", "enlace", raiz_roles),
        Entrada(RAIZ / ".claude/skills", "enlace", raiz_skills),
        Entrada(RAIZ / ".agents/skills", "enlace", raiz_skills),
    ]
    fichas = {raiz_roles / grupo / (rol + ".md") for grupo, roles in ROLES.items() for rol in roles}
    if set(raiz_roles.rglob("*.md")) != fichas:
        raise Conflicto("Revisá el catálogo de roles. Debe contener las 18 fichas del método.")
    for ficha in sorted(fichas):
        ruta = ficha.relative_to(RAIZ).as_posix()
        campos = {
            "name": ficha.stem,
            "description": descripcion(ficha, ficha.stem),
            "developer_instructions": (
                f"Desde la raíz de Oficina, leé completa la ficha {ruta} antes de actuar. "
                "Aplicá su función y sus límites dentro del alcance autorizado. "
                "Usá las herramientas equivalentes a las de la ficha dentro de los permisos del cliente. "
                "Para un rol de lectura, limitá el uso de la terminal a leer, listar y buscar. "
                "Si falta la ficha, avisá para recuperar el catálogo."
            ),
        }
        toml = "".join(f"{clave} = {json.dumps(valor, ensure_ascii=False)}\n" for clave, valor in campos.items())
        entradas.append(Entrada(RAIZ / ".codex/agents" / (ficha.stem + ".toml"),
                                "descriptor", ficha, toml.encode("utf-8")))

    skills = {paquete.name for paquete in raiz_skills.iterdir() if paquete.is_dir()}
    faltantes = SKILLS_INCLUIDAS - skills
    if faltantes:
        raise Conflicto(f"Faltan paquetes del método: {', '.join(sorted(faltantes))}.")
    for nombre in sorted(skills):
        if len(nombre) > 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", nombre):
            raise Conflicto(f"Nombre de skill inválido: {nombre}.")
        descripcion(raiz_skills / nombre / "SKILL.md", nombre)

    ejemplos = {"ejemplos/contexto-inicial.md": "Contexto.md"}
    ejemplos.update({f"ejemplos/primera-idea/{ruta}": f"ideas/primera-idea/{ruta}" for ruta in ARCHIVOS_IDEA})
    for origen, destino in ejemplos.items():
        fuente = RAIZ / origen
        padre_seguro(fuente)
        if tipo(fuente) != "archivo":
            raise Conflicto(f"Falta el ejemplo local {origen}.")
        entradas.append(Entrada(RAIZ / destino, "ejemplo", fuente, fuente.read_bytes()))
    return entradas, len(fichas), len(skills)


def ejecutar(comprobar):
    entradas, roles, skills = plan()
    # Resolver todas las colisiones antes de escribir el primer archivo.
    pendientes = [entrada for entrada in entradas if entrada.pendiente()]
    print(f"Catálogo: {roles} roles y {skills} skills. Arranque: 5 archivos de trabajo.")
    if comprobar and pendientes:
        for entrada in pendientes:
            print(f"Pendiente: {entrada.destino.relative_to(RAIZ)}")
        return 1
    creadas = 0
    for entrada in pendientes:
        try:
            entrada.crear()
            creadas += 1
        except FileExistsError:
            pass  # Otra ejecución pudo terminar el mismo paso.
        if entrada.pendiente():
            raise Conflicto(f"No quedó creada la entrada {entrada.destino.relative_to(RAIZ)}.")
    print(f"Al día. Altas: {creadas}.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, epilog="Salida: 0 al día, 1 pendientes, 2 conflicto.")
    parser.add_argument("--comprobar", action="store_true", help="verificar en modo de solo lectura")
    args = parser.parse_args()
    try:
        sys.exit(ejecutar(args.comprobar))
    except (OSError, ValueError) as error:
        print(f"Revisá la instalación. {error}", file=sys.stderr)
        sys.exit(2)
