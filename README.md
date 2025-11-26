# MiBotPro - AI Bot Configurator (Versión Serverless)

¡Hola! 👋

Esta es una versión completamente nueva y simplificada de tu aplicación, reconstruida para funcionar **100% en el navegador del usuario** sin necesidad de un backend o base de datos.

### Características Principales

*   **Serverless y Estático:** No necesitas un servidor complejo. La aplicación puede ser alojada en cualquier servicio de hosting estático.
*   **Almacenamiento Local:** Todos los datos (usuarios, configuraciones de bots y claves API) se guardan de forma segura en el `localStorage` del navegador del usuario.
*   **Flujo de Activación Simulado:** El proceso de pago y activación de bots es una simulación completa, permitiendo a los usuarios experimentar todo el flujo de trabajo sin transacciones reales.
*   **IA Integrada:** La configuración de bots y el chat de soporte están impulsados por la API de Google Gemini, configurable directamente desde la aplicación.

---

### **Paso 1: 🚀 Lanzamiento**

Simplemente abre el archivo `index.html` en un navegador web. ¡Eso es todo! No hay un paso de "build" o compilación necesario.

---

### **Paso 2: ⚙️ Configuración de la IA**

Para que las funciones de inteligencia artificial funcionen, necesitas configurar tus claves API:

1.  Una vez que la aplicación esté abierta en tu navegador, crea una cuenta de usuario o inicia sesión con `cliente@ejemplo.com` / `password123`.
2.  Ve a la sección **"Ajustes"** en el menú de navegación.
3.  Pega tu **Clave API de Google Gemini** en el campo correspondiente.
4.  Pega la URL de tu **Webhook de n8n** para la simulación de activación.
5.  Haz clic en "Guardar Cambios".

Las claves se guardarán en el almacenamiento de tu navegador, y las funciones de IA (Asistente de Configuración y Chat de Soporte) se activarán inmediatamente.

¡Felicidades! Tu aplicación está lista para usar.