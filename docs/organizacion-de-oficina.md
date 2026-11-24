# Dónde guardar el trabajo

Cada producto tiene una carpeta propia. Para la primera idea, el instalador prepara `ideas/primera-idea/` desde el [ejemplo distribuido](../ejemplos/primera-idea/LEEME.md). Agregá carpetas a medida que haya contenido.

| Dentro del producto | Contenido |
|---|---|
| `LEEME.md` | Tabla «Qué abrir». La primera fila lleva a la entrega vigente o al estado mientras se prepara. |
| `ESTADO.md` | Objetivo, decisión, evidencia y próximo paso. |
| `docs/planificacion/` | Alcance, criterios, decisiones de diseño y plan. |
| `tarjetas/` | Encargo para la sesión de código y parte con resultado. |
| `fuentes/` | Originales recibidos. Cada versión nueva se conserva aparte. |
| `src/` o `scripts/` | Código mantenido. Calculá las rutas desde el propio archivo. |
| `prototipos/` | Ensayos que una persona puede abrir y probar. |
| `tests/salida/` | Resultados descartables de pruebas locales. |
| `entregas/` | Versiones entregadas, fechadas con AAAA-MM-DD y conservadas. |

En la raíz del clon quedan el [mapa general](../README.md), las instrucciones comunes, la guía, sus fuentes y el catálogo del método. El archivo local `Contexto.md` sirve para decisiones de esa instalación. El trabajo de cada persona queda en sus carpetas de ideas. La lista de archivos distribuibles de Git está en `.gitignore`.

Al entregar, abrí el vínculo desde el mapa del producto. Verificá el destino, el contenido y la fecha. Registrá quién aceptó la versión si hubo conformidad y dónde se publicó si hubo publicación.
