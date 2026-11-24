"""Informa las asociaciones entre skills y roles de un catálogo de Oficina."""

import argparse
from pathlib import Path
import re


COORDINACION = {"idea-nueva", "turno", "revisar-skills"}


def leer_ficha(ruta):
    texto = ruta.read_text(encoding="utf-8-sig")
    cabecera = re.match(r"\A---\n(.*?)\n---(?:\n|$)", texto, re.DOTALL)
    if not cabecera:
        raise ValueError(f"{ruta}: falta la cabecera de la ficha")
    campos = {}
    for linea in cabecera[1].splitlines():
        clave, separador, valor = linea.partition(":")
        if separador:
            campos[clave] = valor.strip().strip("\"'")
    for clave in ("name", "description"):
        if not campos.get(clave):
            raise ValueError(f"{ruta}: falta {clave} en la cabecera")
    return campos, texto[cabecera.end():]


def revisar(catalogo):
    skills = {}
    for ruta in sorted((catalogo / "skills").glob("*/SKILL.md")):
        campos, _ = leer_ficha(ruta)
        if campos["name"] != ruta.parent.name:
            raise ValueError(f"{ruta}: el nombre debe coincidir con la carpeta")
        skills[campos["name"]] = campos["description"]
    roles = {}
    for ruta in sorted((catalogo / "roles").glob("*/*.md")):
        campos, cuerpo = leer_ficha(ruta)
        nombre = campos["name"]
        if nombre != ruta.stem or nombre in roles:
            raise ValueError(f"{ruta}: nombre de rol distinto del archivo o repetido")
        marcas = re.findall(r"^Skills afines:[ \t]*(.*)$", cuerpo, re.MULTILINE)
        roles[nombre] = {skill for marca in marcas for skill in re.findall(r"`([^`]+)`", marca)}
    if not skills or not roles:
        raise ValueError("Faltan fichas en skills/ o en roles/ del catálogo indicado")

    asignados = coordinacion = sin_asignar = 0
    for nombre, descripcion in skills.items():
        agentes = sorted(rol for rol, usos in roles.items() if nombre in usos)
        if agentes:
            print(f"{nombre} -> {', '.join(agentes)}")
            asignados += 1
        elif nombre in COORDINACION:
            print(f"{nombre} -> coordinación")
            coordinacion += 1
        else:
            print(f"{nombre} -> sin asignar. {descripcion}")
            sin_asignar += 1

    ausentes = sorted((rol, skill) for rol, usos in roles.items() for skill in usos if skill not in skills)
    for rol, skill in ausentes:
        print(f"Referencia ausente. {rol} menciona {skill}")
    print(f"TOTAL roles={len(roles)} skills={len(skills)} asignados={asignados} "
          f"coordinacion={coordinacion} sin_asignar={sin_asignar} referencias_ausentes={len(ausentes)}")
    return int(bool(ausentes))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalogo", type=Path, default=Path(__file__).resolve().parents[2],
                        help="Carpeta que contiene roles/ y skills/")
    args = parser.parse_args()
    try:
        return revisar(args.catalogo)
    except (OSError, UnicodeError, ValueError) as error:
        parser.exit(2, f"No se pudo revisar el catálogo. {error}\n")


if __name__ == "__main__":
    raise SystemExit(main())
