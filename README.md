*********BACKEND CHALLENGE - Flores, Rosa Maria**********

Este challenge consiste en desarrollar un backend para la gestión de leads, incorporando un endpoint que utiliza Inteligencia Artificial para generar un resumen (summary) y una próxima acción sugerida (next_action).

****Instalación.*****
Como todo proyecto, lo primero es definir el entorno para el mismo, para eso utilice: Node.js (+v18) - npm - redis (xq utilice colas) - Git

!! Redis es importante porque decidi usar Bull para el manejo de tareas asíncronicas.
!! Variables de entorno (.env) utilice GEMINI, aclaración, el API Key de Gemini tiene que estar habilitado en Google Cloud para la Generative Language API, durante el desarrollo esto provoco errores que se explicaran más adelante.

****Funcionamiento.****
El sistema permite:
  Crear leads manualmente. (POST /create-lead)
  Listar todos los leads. (GET /leads)
  Obtener el datalle de un lead. (GET /leads/:id)
  Generar automáticamente un resumen y una acción sugerida usando IA (POST /leads/:id/summarize)

****Organización.****
Como el backend fue desarrollado con NestJs, la arquitectura utilizada es la modular.
La idea principal de esto, es separar responsabilidades:
El Controller solo recibe request HTTP.
El service maneja la lógica.
EL processor se encarga de tareas asíncronas.
El ai.service encapsula toda la lógica de IA.

****Uso de colas.****
Una de las decisiones más importantes fue no ejecutar la IA directamente desde el controller, asi se logro:
  El endpoint /summarize encola un job -> Bull envía ese job a Redis -> un processor lo consume -> el processor llama a la IA -> el resultado se guarda en la bd.

****Flujo complejo del summarize****
Cuando se ejecuta POST /leads/:id/summarize
El controlleer recive el ID del lead, luego se encola un job con ese ID. El processor obtiene el lead desde la base y se envian los datos a la IA quien es la responsable de devolver un JSON con summary y next_action. Luego se actualiza el lead en la bd y el job devuelve el resultado (Respetando el formato final: {
"summary": "string",
"next_action": "string"
}).

!!! Utilicé bull y redis por el manejo de jobs y para separar el request del procesamiento.
!!! AI separado, es mucho más facíl cambiar el modelo de IA, Ej. comencé utilizando una key de OpenAi y al final deje una de Gemini, simplemente se instala la dependencia y se cambia la key en el archivo .env

****ERRORES*****
Durante el desarrollo cometí varios errores, tanto conceptuales como técnicos. Considero importante documentarlos porque forman parte del proceso real y explican muchas de las decisiones finales.

**Confusión sobre qué debia devolver el endpoint /summarize.
Uno de los primeros errores fue interpretar mal la consigna. 
Al principio yo pensaba que:
  El endpoint POST /leads/:id/summarize solo debía disparar el proceso
  y que luego había que hacer un GET /leads/:id para ver el resultado, 
  inicialmente el endpoint me devolvía: {"message": "Lead summarization scheduled}
Al leer la consigna de nuevo, ví que piden explicitamente que el resultado respete el formato {"summary": "string","next_action": "string"}
Para corregir modifique el flujo para que el controller espere a que el job termine (job.finished()) y devuelva: {"summary": "string","next_action": "string"}

**Error con colas: Use cola pero no devolví el resultado.
Al principio pensé que al utilizar colas el endpoint no podia devolver el resultado, pero si se puede encolar y esperar el resultado del job.

**Había definido la cola en el módulo pero no la había inyectado en el constructor del controller.

**Problemas con OpenAI y Gemini.
En el desarrollo del endpoint de resumen con IA sugieron problemas relacionados no al código, si no a los proveedores de IA.
OPENAI, el flujo funciono bien a nivel codigo (el worker consumia al job desde la cola, se llamaba al servicio de IA y se esperaba un JSON con summary y next_action) pero cuando hice priebas la api comenzó a responder con errores, lo que me afecto a la respuesta, el problema fue que la IA no estaba disponible.

Luego intente con Gemini me encontré con modelos no disponibles para el endpoint, errores de configuracion relaciones con la api key.

Estos problemas no me afectaron al backend porque se aislo la lógica de la IA, asi es mucho mas facil cambia el proveedor sin afectar al resto. Aun así no logre encontrar un modelo disponible para realizar la prueba con el endpoint.

