---
name: equipo-base
description: Elige el rol de implementación, revisión o investigación para una tarjeta sin especialista del producto.
---

# Equipo Base

Usá esta guía cuando una tarjeta ya identifica el resultado buscado. Antes de repartir trabajo, localizá la fuente que cambia, las pruebas que la cubren y quién más escribe ahí.

| Pedido | Rol | Entrega |
|---|---|---|
| Sustituir un texto o valor completamente especificado | `mecanico` | Cambio literal y coincidencias comprobadas |
| Implementar un comportamiento que requiere criterio | `implementador` | Cambio funcional y aceptación |
| Arreglar una falla localizada | `corrector` | Arreglo mínimo y reproducción del caso |
| Reunir antecedentes del producto | `investigador` | Hallazgos con ubicación y fecha |
| Revisar la lógica de un cambio | `revisor` | Hallazgos con archivo, línea y efecto |
| Adaptar Apps Script o una fórmula de planilla | `apps-script` | Fuentes locales y prueba guiada sobre una copia |

## Del encargo al resultado

1. Planificación redacta una tarjeta autosuficiente. Nombrá el rol, los archivos autorizados, las pruebas que siguen vigentes y una aceptación observable. Para un cambio mecánico incluí texto de origen y destino.
2. La conversación de código coordina los trabajos aprobados. Un especialista del producto puede asumir una tarjeta de su área. Usá hasta tres roles en paralelo cuando los archivos sean independientes.
3. Quien implementa devuelve la salida de la aceptación. Quien coordina verifica el resultado en el punto de entrada que usará la persona.
4. Pedí revisión de lectura cuando el cambio lo amerite. Registrá los hallazgos reproducibles y asigná al corrector el caso concreto con las mismas condiciones de aceptación.

Las fichas canónicas están en `catalogo/roles/base/`, dentro del clon. Para una publicación, instalación o intervención sobre un servicio, la persona responsable define alcance y autorización por separado.
