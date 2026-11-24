---
name: idea-nueva
description: Lleva una idea de producto desde la definición hasta un plan aprobado con seis documentos y decisiones registradas.
---

# Idea nueva

Leé `ideas/CLAUDE.md` y el estado de la idea dentro de este clon. Para una consulta puntual alcanza con registrar la pregunta, la evidencia y la decisión. Usá los seis pasos cuando haya que diseñar un producto completo.

## Preparación

1. Acordá un nombre corto y abrí `ideas/<nombre>/ESTADO.md`. Si ya existe, retomá desde «Ahora».
2. Anotá objetivo, destinatario, evidencia disponible, supuesto que podría cambiar la decisión y siguiente acción.
3. Guardá los documentos de trabajo en `docs/planificacion/` de la idea y enlazalos desde su estado. Cada pregunta pendiente lleva responsable.

| Paso | Responsable | Documento y contenido mínimo | Revisión |
|---|---|---|---|
| 1 | `estratega` | `PRD.md` con problema, destinatarios, funciones imprescindibles, postergados y alcance | Una decisión de prioridad por función |
| 2 | `arquitecto` | `TRD.md` con una fila por requisito, su prueba y resultado esperado | Confirmar las condiciones técnicas |
| 3 | `disenador` | `FLUJO.md` con pantallas, transiciones y estados vacíos o de error | Recorrer una tarea de principio a fin |
| 4 | `disenador` | `DISENO.md` con jerarquía de la información, componentes y contraste | Elegir las opciones que afecten el uso |
| 5 | `arquitecto` | `BACKEND.md` con entidades, relaciones, entradas y resultados | Validar el modelo o registrar por qué se prescinde de backend |
| 6 | `pm` | `PLAN.md` y tareas JSON con responsables, dependencias, archivos y aceptación | Confirmar las oleadas y el destino por producto |

## Aprobaciones

- **A. Alcance.** Al cerrar el PRD registrá qué entra, qué se posterga y quién decidió. Retomá los pasos 2 a 5 con ese alcance.
- **B. Solución.** Revisá los documentos técnicos y de diseño con los recorridos elegidos. Actualizá las decisiones en el estado antes de pasar al plan.
- **C. Ejecución.** Con las oleadas y el destino aprobados, conservá los antecedentes de la idea y enlazá el plan vigente desde el mapa del producto. Abrí la conversación de código con la primera tarjeta aprobada.

Para revisar varias opciones, acordá con la persona un documento compartible o una página de revisión si dispone de esa herramienta. La revisión también puede hacerse en Markdown local. Conservá la elección, el comentario, su autor y la fecha. Al retomar, la primera línea del estado debe permitir identificar la próxima decisión o prueba.
