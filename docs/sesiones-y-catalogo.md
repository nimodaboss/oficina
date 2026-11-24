# Sesiones y catálogo

## Abrir la conversación de código

Planificación guarda el objetivo, el alcance aprobado, las rutas y el comando de aceptación en la tarjeta. Dejá la conversación de planificación abierta. Desde la raíz del clon, planificación inicia otro proceso del cliente con su herramienta de terminal y recupera el control mientras ese proceso trabaja. Estos comandos usan el ejemplo inicial y suponen que la persona ya aprobó la tarjeta.

**Codex**

```sh
codex exec --sandbox workspace-write --json "Sos la sesión independiente de código. Leé ideas/primera-idea/tarjetas/IDEA-1.md y ejecutá el alcance aprobado. Dejá la evidencia en la tarjeta."
```

Registrá el `thread_id` del evento `thread.started` en el estado local de la idea. Para volver a esa conversación desde una terminal, reemplazá `ID_GUARDADO` por ese valor.

```sh
codex resume ID_GUARDADO
```

**Claude Code**

```sh
claude --bg --name "Código IDEA-1" "Leé ideas/primera-idea/tarjetas/IDEA-1.md como sesión independiente de código. Ejecutá el alcance aprobado y dejá la evidencia en la tarjeta."
```

Registrá el identificador que imprime el cliente. Para ver la sesión en una terminal usá ese identificador.

```sh
claude attach ID_GUARDADO
```

Si se interrumpe el arranque, consultá el registro de la tarjeta y la actividad del proceso antes de repetirlo. En Claude, `claude agents --json --all` permite reconocer sesiones ya creadas. Si tu versión carece de `--bg`, planificación puede iniciar `claude -p --output-format json` con el mismo mensaje en un proceso aparte, guardar el `session_id` de la respuesta y volver con `claude --resume ID_GUARDADO`. En Codex, revisá también la salida JSON que guardó planificación. Si el cliente necesita autenticación o una decisión de confianza, la toma la persona en su terminal. Tras habilitar el directorio, abrí la sesión desde la raíz del clon.

Código deja en la tarjeta qué cambió, el comando ejecutado, su resultado y cualquier límite. Planificación relee los archivos indicados, actualiza el estado y comprueba el acceso desde el mapa. Mirá el [plan de ejemplo](../ejemplos/primera-idea/docs/planificacion/plan.md).

## Dónde vive cada definición

| Contenido | Original que se edita | Acceso desde Claude Code | Acceso desde Codex |
|---|---|---|---|
| Método común | [CLAUDE.md](../CLAUDE.md) | Instrucción de la raíz | [AGENTS.md](../AGENTS.md) remite al método |
| 18 roles | `catalogo/roles/<equipo>/<rol>.md` | `.claude/agents/` abre el árbol de fichas | Cada TOML de `.codex/agents/` indica leer la ficha original por su ruta |
| 8 skills del método y extensiones locales | `catalogo/skills/<nombre>/`, incluido su `SKILL.md` y sus recursos | `.claude/skills/` | `.agents/skills/` |

El rol `extractor-gdm` es una especialidad opcional para validar exportaciones provistas por quien pide el análisis. Se puede usar el resto de Oficina sin ese sistema. Si un rol necesita un lector, una biblioteca o una herramienta ausente, comprobá la disponibilidad antes de asignarle la tarea.

Para cambiar instrucciones de un rol, usá la guía o editá el Markdown canónico. Para cambiar una skill, editá su carpeta original. Conservá el identificador y los campos del encabezado. Al iniciar otra conversación, pedile al cliente que lea el original de ese rol o que cargue la skill por nombre. Podés verificar una edición pidiéndole que cite una frase recién cambiada. El HTML muestra la instantánea que creó el generador y relee el original cuando vinculás la carpeta. Los pasos de regeneración están en el [README](../README.md).

### Sumar una skill propia

Los paquetes personales se incorporan por elección de quien usa el clon. Esto también sirve para una skill propia de diagramas de procesos.

1. Elegí un paquete que puedas usar y compartir. Guardá su única edición en `catalogo/skills/mi-metodo/` con sus recursos y referencias relativos a esa carpeta.
2. Al principio de `SKILL.md` incluí este encabezado. Debajo escribí las condiciones de uso, los pasos y el resultado esperado.

   ```yaml
   ---
   name: mi-metodo
   description: Revisa una propuesta y registra las preguntas pendientes.
   ---
   ```

3. Ejecutá el instalador y su comprobación desde la raíz según el README. El total de skills debe aumentar en uno. Abrí conversaciones nuevas y pedí la skill por nombre. Si hay otra con el mismo nombre en tu cliente, elegí un nombre propio y hacelo coincidir con su carpeta. El paquete personal queda fuera de la selección distribuible de Git.
