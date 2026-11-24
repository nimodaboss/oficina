| Qué abrir | Para qué |
|---|---|
| [Guía interactiva de Oficina](guia.html) | Abrir las reglas, editar una ficha de rol y recorrer el mapa de carpetas. |
| [Primera idea de ejemplo](ejemplos/primera-idea/LEEME.md) | Ver una agenda de reunión con plan, estado y tarjeta de ejecución. |
| [Sesiones y catálogo](docs/sesiones-y-catalogo.md) | Abrir y retomar la sesión de código o incorporar una skill propia. |

# Oficina

Oficina organiza el trabajo entre una persona, una conversación de planificación y una conversación de código. Planificación guarda un plan y una tarjeta. Código ejecuta lo aprobado y deja evidencia. El mapa de cada producto permite volver a la entrega.

## Crear tu carpeta

Necesitás Git, Python 3.9 o posterior y permiso de escritura en el directorio que elijas. Calculá unos cinco minutos si ya los tenés. Para trabajar con un asistente necesitás Claude Code o Codex instalado y autenticado. Para consultar la guía alcanza con un navegador. Para guardar cambios en el Markdown desde la guía, usá Edge o Chrome de escritorio.

**Windows, en PowerShell**

1. Abrí PowerShell en la carpeta donde querés guardar tus proyectos. Comprobá las herramientas.

   ```powershell
   git --version
   ```

   ```powershell
   python --version
   ```

2. Creá un directorio padre llamado `Mis proyectos` en esa ubicación y entrá en él. Podés cambiar ese nombre. Si ya tenés el directorio padre que querés usar, abrí PowerShell ahí y pasá al paso 3.

   ```powershell
   New-Item -ItemType Directory -Path "Mis proyectos" -Force | Out-Null
   ```

   ```powershell
   Set-Location -LiteralPath "Mis proyectos"
   ```

3. Cloná Oficina. Si ya existe una entrada llamada `oficina`, este bloque se detiene. Para una instalación independiente elegí otro directorio padre. Si reconocés un clon que querés seguir usando, abrilo y pasá al paso 5.

   ```powershell
   if (Test-Path -LiteralPath "oficina") { throw "Ya existe oficina. Elegí otro directorio padre o abrí tu clon existente." }
   git clone https://github.com/nimodaboss/oficina.git oficina
   ```

4. Cuando Git indique que terminó, entrá en la nueva carpeta.

   ```powershell
   Set-Location -LiteralPath "oficina"
   ```

5. Prepará el catálogo y la primera idea. Verificá la instalación y la guía.

   ```powershell
   python scripts/instalar.py
   ```

   ```powershell
   python scripts/instalar.py --comprobar
   ```

   ```powershell
   python scripts/generar-guia.py --comprobar
   ```

**macOS o Linux, en la terminal**

1. Abrí la terminal en el lugar donde querés guardar tus proyectos. Comprobá las herramientas.

   ```sh
   git --version
   ```

   ```sh
   python3 --version
   ```

2. Creá el directorio padre y entrá en él. Si ya estás en el directorio que querés usar, pasá al paso 3.

   ```sh
   mkdir -p "Mis proyectos"
   ```

   ```sh
   cd "Mis proyectos"
   ```

3. Cloná en una carpeta nueva. Si aparece el aviso de carpeta existente, elegí otro padre o entrá al clon que ya conocés y seguí en el paso 5.

   ```sh
   if [ -e oficina ] || [ -L oficina ]; then
     echo "Ya existe oficina. Elegí otro directorio padre o abrí tu clon existente."
   else
     git clone https://github.com/nimodaboss/oficina.git oficina
   fi
   ```

4. Cuando termine la clonación, entrá en la carpeta.

   ```sh
   cd oficina
   ```

5. Prepará el catálogo y la primera idea. Verificá la instalación y la guía.

   ```sh
   python3 scripts/instalar.py
   ```

   ```sh
   python3 scripts/instalar.py --comprobar
   ```

   ```sh
   python3 scripts/generar-guia.py --comprobar
   ```

### Qué vas a encontrar

La comprobación inicial debe reconocer **18 roles en cinco equipos y ocho skills**. Los originales viven en `catalogo/`. El instalador prepara los accesos de ambos clientes dentro del clon, un `Contexto.md` local y cuatro archivos para trabajar en `ideas/primera-idea/`. Podés volver a ejecutarlo después de editar uno de esos archivos. Conserva el contenido que ya existe. El instalador usa la biblioteca estándar de Python. En Windows usá CPython y un directorio local que admita uniones de directorios (por ejemplo, un volumen NTFS). En macOS y Linux se usan enlaces del sistema de archivos. Cloná en la ubicación definitiva antes de instalar. El comando de comprobación debe terminar con `Al día. Altas: 0.`.

Las ocho skills incluidas son `equipo-base`, `equipo-datos`, `equipo-direccion`, `equipo-librarian`, `equipo-research`, `idea-nueva`, `revisar-skills` y `turno`. Para completar el catálogo con un paquete personal, seguí el procedimiento de [Sesiones y catálogo](docs/sesiones-y-catalogo.md).

## Probar la primera idea

1. Desde la raíz de `oficina`, abrí el cliente que uses con uno de estos comandos. Si te pide autenticarte, usá tu cuenta. Si te pide confiar en el directorio, revisá la ruta y las instrucciones del clon antes de elegir. La confianza de proyecto permite cargar configuración local.

   ```sh
   codex
   ```

   ```sh
   claude
   ```

2. En el chat, escribí «Leé el estado de ideas/primera-idea y mostrame la tarjeta para preparar la agenda». Vas a ver el objetivo, el rol y una prueba que compara el contenido de la entrega con el pedido. Si querés probar otra idea, podés pedir una nueva.
3. Si te sirve el ejercicio, respondé «Apruebo IDEA-1. Abrí la sesión independiente de código y seguí la tarjeta hasta verificar la agenda». Planificación registra la aprobación y el identificador local de la nueva conversación. Código arma el Markdown y deja el resultado de la prueba en la tarjeta.
4. Abrí `ideas/primera-idea/LEEME.md`. Después del cierre de planificación, su primera fila debe llevar a la agenda fechada. Tu estado, tus tarjetas y tus entregas quedan fuera de la selección de Git. El ejemplo público vive en `ejemplos/`.

## Consultar y editar con la guía

1. En el explorador de archivos, hacé doble clic en `guia.html`, en la raíz. Podés buscar un rol, ver sus responsabilidades o abrir el mapa.
2. Elegí una regla o un rol y tocá **Vincular carpeta**. Seleccioná la carpeta del clon, la que contiene `guia.html`. Concedé el acceso cuando lo pida el navegador.
3. Tocá **Editar original**, cambiá el texto y elegí **Revisar cambios**. Comprobá la ruta y la diferencia. Tocá **Confirmar guardado**. Abrí el Markdown de esa ruta para comprobar el resultado en disco. Si recargás la página y perdió el permiso, vinculá la misma carpeta.
4. Para actualizar la edición que se puede consultar por doble clic sin vincular carpeta, regenerá el HTML desde la raíz. En macOS y Linux usá `python3`.

   ```sh
   python scripts/generar-guia.py
   ```

   ```sh
   python scripts/generar-guia.py --comprobar
   ```

La edición vinculada guarda en el original del clon. Los dos clientes leen el cuerpo actualizado de esa ficha. La instantánea HTML contiene el texto de las reglas y roles en el momento de generarla. Revisá ese texto antes de compartir una edición personalizada.

## Si un paso se detiene

| Qué ves | Cómo seguir |
|---|---|
| La terminal no encuentra Git, Python o el cliente elegido | Instalá la herramienta correspondiente para tu sistema y abrí otra terminal. Si Windows ofrece el lanzador de Python, podés usar `py -3` en lugar de `python`. Volvé a comprobar la versión. |
| Git indica que no puede acceder al repositorio | Comprobá la conexión y el acceso con tu cuenta. Retomá desde el paso de clonación cuando el repositorio esté disponible. |
| El instalador informa un conflicto | Revisá la ruta que imprime. Conservá tu archivo o vínculo existente. Podés preparar un clon en otro directorio padre y comparar ambos antes de elegir qué conservar. |
| La verificación de la guía detecta diferencias | Si la edición del Markdown fue intencional, regenerá la guía y repetí su comprobación. |
| El cliente no reconoce el rol o la skill | Abrilo desde la raíz después de instalar, revisá la confianza del proyecto y repetí la comprobación del catálogo. Para ver cómo lo busca cada cliente, consultá [Sesiones y catálogo](docs/sesiones-y-catalogo.md). |
| El navegador informa un cambio externo o no permite escribir | Conservá el borrador, releé el original y volvé a revisar la diferencia. Para editar en un navegador de solo lectura, descargá la copia o abrí el Markdown en tu editor habitual. |

Si persiste un problema, pasale a tu conversación de planificación el comando, la ruta relativa y el mensaje que apareció. Con esos datos puede retomar el paso que falló.
