---
name: turno
description: Coordina tarjetas aprobadas, verifica las aceptaciones y documenta el parte de ejecución.
---

# Turno de ejecución

Usá esta guía desde la conversación independiente de código. Tomá la tarjeta y el estado del producto como punto de partida. La sesión de planificación mantiene el mapa y las decisiones generales.

## Despacho

1. Leé lo aprobado, registrá el estado inicial de los archivos y, si existe un repositorio local, examiná los cambios previos.
2. Seleccioná tarjetas con autorización vigente y dependencias resueltas. Pasalas de `aprobada` a `en curso`. Formá oleadas de hasta tres tarjetas que puedan escribir en archivos distintos.
3. Asigná cada tarjeta al rol indicado. Incluí la ruta, los archivos permitidos, las pruebas existentes y el resultado observable que la cierra. El modelo y las herramientas serán los disponibles en el cliente.

## Aceptación

1. Quien implementa corre la aceptación de la tarjeta. Quien coordina la reproduce y registra comando, salida y fecha. Verificá en el punto de uso cuando haya una interfaz.
2. Si falla, conservá el resultado y ubicá la causa. Prepará la corrección con el sufijo `b`, el síntoma reproducible, el resultado esperado y los archivos permitidos. Asignala al rol `corrector`. Al repetirse el fallo devolvé la decisión a planificación con el bloqueo.
3. Al pasar la aceptación, registrá `hecha`. Si la siguiente acción necesita una autorización nueva o supera lo aprobado, registrá `frenada` con su causa y continuá los trabajos independientes.
4. Al terminar la oleada final, corré la suite del producto si existe. Ante una falla, repetí el caso aislado y comprobá diferencias de carga, orden o estado antes de volver a correr el conjunto.

## Parte

Indicá fecha, tarjetas, cambios, pruebas y resultados. Conservá las fallas parciales, lo pendiente, las decisiones requeridas y el lugar donde se abre la entrega. Si el cliente informa consumo, consigná la lectura disponible con su unidad. Devolvé a planificación el parte y el estado de cada aceptación. Una entrega local y una publicación externa se registran por separado.
