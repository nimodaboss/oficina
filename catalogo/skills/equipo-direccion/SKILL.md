---
name: equipo-direccion
description: Distribuye las decisiones de producto entre estrategia, arquitectura, diseño y planificación.
---

# Equipo Dirección

Arrancá por la pregunta y las personas que usarán el resultado. La sesión de planificación guarda las decisiones y coordina a estos roles.

| Rol | Pregunta | Documento o resultado |
|---|---|---|
| `estratega` | ¿Para quién, con qué objetivo y hasta dónde? | Brief con imprescindibles, postergados y límites |
| `arquitecto` | ¿Cómo se comprueba cada requisito y qué datos necesita? | Requisitos técnicos y esquema de datos |
| `disenador` | ¿Qué recorrido hace la persona y qué ve en cada estado? | Flujo, estados y decisiones de diseño |
| `pm` | ¿Quién hace qué y cómo se acepta? | Plan en oleadas y tarjetas con dependencias |

## Secuencia

1. Revisá el brief con quien pidió el producto y registrá la decisión con fecha.
2. Para un producto completo, consultá `idea-nueva`. El arquitecto y el diseñador documentan la solución con el alcance aprobado y marcan las preguntas que tienen dueño.
3. El PM toma lo aprobado, localiza pruebas existentes y propone oleadas de hasta tres tareas con archivos independientes. Cada tarjeta identifica archivos permitidos, formato de entrega y un comando o acción con resultado comprobable.
4. Cuando se apruebe ejecutar, planificación abre la conversación recuperable de código y enlaza la tarjeta en el estado.
5. Con las primeras mediciones, el PM compara resultado y objetivo, e identifica qué cambio requeriría otra decisión de alcance.

Para las tareas en JSON, usá un objeto `tareas` con una lista. En cada elemento consigná `id`, `titulo`, `equipo`, `agente`, `depende_de`, `archivos_permitidos`, `pruebas_existentes`, `especificacion` y `aceptacion`. En la aceptación guardá por separado la acción y el resultado esperado.
