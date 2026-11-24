---
name: equipo-datos
description: Organiza la extracción local, el cálculo reproducible y la representación de métricas.
---

# Equipo Datos

Partí de una pregunta que se pueda contestar con los datos disponibles. Registrá la unidad, el período y la población antes de asignar la tarjeta.

| Rol | Entrada | Entrega |
|---|---|---|
| `extractor-gdm` | Exportación local de GDM y su diccionario | Archivo normalizado, conteos y registros observados |
| `analista` | Fuente validada, definición y reglas de inclusión | Cálculo reproducible y límites de interpretación |
| `dataviz` | Valores calculados, unidad y comparación | Gráfico accesible con títulos y etiquetas |
| `tablero-html` | Indicadores validados y preguntas del destinatario | Tablero generado y recorrido comprobado en navegador |

## Cómo armar las tarjetas

1. Si el origen es una exportación de GDM, encargá su lectura a `extractor-gdm`. Es una especialidad opcional. Con una tabla local ya validada se puede empezar por el cálculo.
2. Indicá al analista cómo tratar fechas, faltantes y duplicados. Pedí el número de registros antes y después de filtrar, el valor resultante y un contraste independiente cuando esté disponible.
3. Pasá el resultado al rol de visualización. Un gráfico puede aceptarse con datos vacíos, un punto y varias categorías. Para un tablero incluí cómo abrirlo y qué filtro o acción reproduce la decisión prevista.
4. El PM compara lo observado con la meta del producto y presenta las alternativas que requieran una elección.

Trabajá sobre copias autorizadas. Conservá los originales y mantené los registros individuales en las ubicaciones acordadas. El método admite archivos locales y herramientas ya disponibles en el producto.
