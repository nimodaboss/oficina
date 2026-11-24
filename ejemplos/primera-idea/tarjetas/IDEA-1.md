# IDEA-1 · Preparar una agenda de reunión

estado: propuesta

**Tipo y rol.** Cambio mecánico. La sesión de código puede asignarlo a `mecanico`. Depende de la aprobación de la persona, que planificación registra aquí con la fecha. Leé el [plan](../docs/planificacion/plan.md).

**Rutas permitidas.** Esta tarjeta para el parte y `ideas/primera-idea/entregas/agenda-AAAA-MM-DD.md` para la entrega. Usá la fecha del día de ejecución. Si ya hay una entrega con ese nombre, comprobá primero su contenido y preservá cualquier edición de la persona.

**Encargo.** A partir de la aprobación, pasá la tarjeta a `en curso`. Creá el archivo con este contenido en UTF-8 y terminá la última pregunta con un solo salto de línea.

```markdown
# Agenda de reunión

## Objetivo
¿Qué necesitamos decidir?

## Temas
¿Qué vamos a conversar?

## Acuerdos
¿Cuál es el próximo paso y quién se encarga?
```

**Aceptación.** Desde la raíz del clon, el comando debe imprimir `Agenda verificada`. En macOS y Linux usá `python3` en lugar de `python`.

```sh
python -c "from datetime import date; from pathlib import Path; p=Path('ideas/primera-idea/entregas')/('agenda-'+date.today().isoformat()+'.md'); t=Path('ideas/primera-idea/tarjetas/IDEA-1.md').read_text(encoding='utf-8').split(chr(96)*3+'markdown'+chr(10),1)[1].split(chr(96)*3,1)[0]; coincide=p.read_text(encoding='utf-8')==t; print('Agenda verificada' if coincide else 'La agenda difiere del modelo'); raise SystemExit(int(not coincide))"
```

En el parte anotá la fecha, la ruta y la salida real. Si pasa, registrá `hecha` y avisá a planificación para que abra la entrega y actualice el [mapa](../LEEME.md) y el [estado](../ESTADO.md). Consigná la conformidad cuando la persona la dé.
