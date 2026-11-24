---
name: revisar-skills
description: Cruza las skills del catálogo compartido con las fichas de rol y propone asociaciones para las que faltan.
---

# Revisar skills

Esta revisión usa únicamente los archivos del catálogo de la copia abierta. Cada ficha de rol puede declarar sus guías afines en una línea del cuerpo.

```markdown
Skills afines: `equipo-base`.
```

1. Desde la raíz del clon ejecutá el script con el intérprete de Python que usaste para instalar Oficina.

   ```shell
   python -B catalogo/skills/revisar-skills/revisar-skills.py
   ```

   Si tu intérprete se llama `python3`, usá ese nombre.
2. Leé la tabla de asociaciones y los totales. Las guías de coordinación aparecen por separado cuando solo le corresponden a la sesión principal.
3. Por cada skill sin asignar, revisá su descripción y sugerí un rol y un caso de uso. Por cada referencia ausente, comprobá si falta incorporar la skill o corregir el nombre en la ficha.
4. Devolvé la propuesta para revisión. Esta operación solo lee el catálogo. Ejecutala otra vez después de una asociación aprobada.

La ruta del catálogo se determina desde el script. Para revisar otro catálogo local con el mismo formato, ejecutalo con `--catalogo RUTA`.
