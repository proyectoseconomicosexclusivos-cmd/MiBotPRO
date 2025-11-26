import React from 'react';
import { BotTemplate } from '../types';
import {
  PhoneIcon,
  WhatsAppIcon,
  CalendarIcon,
  TruckIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  PaintBrushIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from '../constants/icons';

// --- DEFINICIONES DE CAMPOS DE INTEGRACIÓN REALES ---

const RETELL_FIELDS = [
    {
        key: 'retellApiKey',
        label: 'Retell AI API Key',
        type: 'password' as const,
        placeholder: 'key_...',
        helpText: 'Necesaria para orquestar las llamadas de voz.',
        helpUrl: 'https://docs.retellai.com/guide/api-keys'
    },
    {
        key: 'retellAgentId',
        label: 'Retell Agent ID',
        type: 'text' as const,
        placeholder: 'oBeD...',
        helpText: 'El ID del agente de voz creado en tu panel de Retell.',
    }
];

const TWILIO_FIELDS = [
    {
        key: 'twilioSid',
        label: 'Twilio Account SID',
        type: 'text' as const,
        placeholder: 'AC...',
        helpText: 'Identificador de tu cuenta de Twilio para SMS/WhatsApp.',
        helpUrl: 'https://www.twilio.com/console'
    },
    {
        key: 'twilioToken',
        label: 'Twilio Auth Token',
        type: 'password' as const,
        placeholder: '...',
        helpText: 'Token de seguridad para autorizar el envío de mensajes.',
    }
];

const CALENDAR_FIELDS = [
    {
        key: 'googleCalendarId',
        label: 'Google Calendar ID',
        type: 'text' as const,
        placeholder: 'tu_email@gmail.com',
        helpText: 'El ID del calendario donde se agendarán las citas.',
    },
    {
        key: 'bookingPageUrl',
        label: 'URL Pública de Reserva (Calendly/Google)',
        type: 'url' as const,
        placeholder: 'https://calendly.com/tu-negocio',
        helpText: 'Enlace directo para que los clientes finalicen la reserva si el bot no puede.',
    }
];

const MAKE_WEBHOOK = [
    {
        key: 'makeWebhookUrl',
        label: 'Make/n8n Webhook URL',
        type: 'url' as const,
        placeholder: 'https://hook.eu1.make.com/...',
        helpText: 'La URL del escenario que procesará la lógica compleja.',
    }
];

export const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: '01_atencion_telefonica',
    title: 'Atención Telefónica IA',
    description: 'Asistente de voz ultra-realista que contesta llamadas y gestiona consultas.',
    category: 'Atención al Cliente',
    icon: React.createElement(PhoneIcon),
    integrations: ['Retell AI', 'Twilio'],
    requiredIntegrations: [...RETELL_FIELDS, ...TWILIO_FIELDS],
    price: 99,
  },
  {
    id: '02_whatsapp_atencion',
    title: 'Atención por WhatsApp',
    description: 'Bot de chat automatizado para WhatsApp Business API.',
    category: 'Atención al Cliente',
    icon: React.createElement(WhatsAppIcon),
    integrations: ['Twilio', 'OpenAI'],
    requiredIntegrations: [...TWILIO_FIELDS, {
        key: 'openaiApiKey',
        label: 'OpenAI API Key',
        type: 'password',
        placeholder: 'sk-...',
        helpText: 'Para generar las respuestas inteligentes del chat.',
    }],
    price: 99,
  },
  {
    id: '03_reservas_citas',
    title: 'Reservas y Citas',
    description: 'Gestión de agenda automática conectada a Google Calendar.',
    category: 'Gestión',
    icon: React.createElement(CalendarIcon),
    integrations: ['Google Calendar', 'OpenAI'],
    requiredIntegrations: [...CALENDAR_FIELDS, ...MAKE_WEBHOOK],
    price: 129,
  },
  {
    id: '04_seguimiento_pedidos',
    title: 'Seguimiento de Pedidos',
    description: 'Consulta estado de pedidos en WooCommerce/Shopify y notifica.',
    category: 'E-commerce',
    icon: React.createElement(TruckIcon),
    integrations: ['WooCommerce', 'Twilio'],
    requiredIntegrations: [
        {
            key: 'ecommerceApiUrl',
            label: 'URL API E-commerce',
            type: 'url',
            placeholder: 'https://tienda.com/wp-json/wc/v3',
            helpText: 'Endpoint para consultar pedidos.',
        },
        {
            key: 'ecommerceKey',
            label: 'Consumer Key',
            type: 'password',
            placeholder: 'ck_...',
            helpText: 'Clave de lectura de tu tienda.',
        },
        ...TWILIO_FIELDS
    ],
    price: 99,
  },
  {
    id: '05_cobros_recordatorios',
    title: 'Cobros y Recordatorios',
    description: 'Automatización de cobros y facturas vencidas.',
    category: 'Finanzas',
    icon: React.createElement(CreditCardIcon),
    integrations: ['Stripe', 'Twilio'],
    requiredIntegrations: [
        {
            key: 'stripeSecretKey',
            label: 'Stripe Secret Key',
            type: 'password',
            placeholder: 'sk_live_...',
            helpText: 'Para generar enlaces de pago reales.',
        },
        ...TWILIO_FIELDS
    ],
    price: 149,
  },
  {
    id: '06_restaurante_delivery',
    title: 'Restaurante y Delivery',
    description: 'Toma de comandas por voz o chat.',
    category: 'Hostelería',
    icon: React.createElement(BuildingStorefrontIcon),
    integrations: ['OpenAI', 'WooCommerce'],
    requiredIntegrations: [...RETELL_FIELDS, ...MAKE_WEBHOOK],
    price: 149,
  },
  {
    id: '07_peluqueria_barberia',
    title: 'Peluquería y Barbería',
    description: 'Agenda para salones de belleza.',
    category: 'Servicios',
    icon: React.createElement(PaintBrushIcon),
    integrations: ['Google Calendar', 'Twilio'],
    requiredIntegrations: [...CALENDAR_FIELDS, ...TWILIO_FIELDS],
    price: 129,
  },
  {
    id: '08_taller_mecanico',
    title: 'Taller Mecánico',
    description: 'Citas de revisión y avisos de "coche listo".',
    category: 'Servicios',
    icon: React.createElement(CogIcon),
    integrations: ['OpenAI', 'Twilio'],
    requiredIntegrations: [...CALENDAR_FIELDS, ...TWILIO_FIELDS],
    price: 149,
  },
  {
    id: '09_gimnasio_clases',
    title: 'Gimnasio y Clases',
    description: 'Reservas de clases colectivas.',
    category: 'Salud y Deporte',
    icon: React.createElement(UserGroupIcon),
    integrations: ['Google Calendar', 'OpenAI'],
    requiredIntegrations: [...CALENDAR_FIELDS],
    price: 129,
  },
  {
    id: '10_hoteles_apartamentos',
    title: 'Hoteles / Apartamentos',
    description: 'Conserje virtual para huéspedes.',
    category: 'Hostelería',
    icon: React.createElement(BuildingOffice2Icon),
    integrations: ['Retell AI', 'Stripe'],
    requiredIntegrations: [...RETELL_FIELDS, ...MAKE_WEBHOOK],
    price: 199,
  },
  {
    id: '11_creacion_contenido',
    title: 'Creación de Contenido',
    description: 'Generador de posts y emails.',
    category: 'Marketing',
    icon: React.createElement(SparklesIcon),
    integrations: ['OpenAI'],
    requiredIntegrations: [], 
    price: 199,
  },
  {
    id: '12_generacion_imagenes_videos',
    title: 'Generación de Imágenes',
    description: 'Creador visual para redes.',
    category: 'Marketing',
    icon: React.createElement(VideoCameraIcon),
    integrations: ['OpenAI'],
    requiredIntegrations: [],
    price: 199,
  },
  {
    id: '13_calendario_editorial',
    title: 'Calendario Editorial',
    description: 'Planificador de contenidos.',
    category: 'Marketing',
    icon: React.createElement(CalendarDaysIcon),
    integrations: ['OpenAI', 'Notion'],
    requiredIntegrations: [
        {
            key: 'notionApiKey',
            label: 'Notion API Key',
            type: 'password',
            placeholder: 'secret_...',
            helpText: 'Para guardar el calendario en tu Notion.',
        }
    ],
    price: 149,
  },
  {
    id: '14_copywriting_ia',
    title: 'Copywriting IA',
    description: 'Redactor persuasivo.',
    category: 'Marketing',
    icon: React.createElement(PencilSquareIcon),
    integrations: ['OpenAI'],
    requiredIntegrations: [],
    price: 149,
  },
  {
    id: '15_analisis_redes',
    title: 'Análisis de RRSS',
    description: 'Analítica de sentimiento y métricas.',
    category: 'Marketing',
    icon: React.createElement(ChartBarIcon),
    integrations: ['OpenAI', 'Make'],
    requiredIntegrations: [...MAKE_WEBHOOK],
    price: 149,
  },
  {
    id: '16_asistente_virtual_interno',
    title: 'Asistente Virtual Interno',
    description: 'Ayuda para empleados.',
    category: 'Recursos Humanos',
    icon: React.createElement(UserGroupIcon),
    integrations: ['OpenAI', 'Slack'],
    requiredIntegrations: [
        {
            key: 'slackWebhook',
            label: 'Slack Webhook URL',
            type: 'url',
            placeholder: 'https://hooks.slack.com/...',
            helpText: 'Para conectar el bot a un canal de Slack.',
        }
    ],
    price: 99,
  },
  {
    id: '17_informes_analitica',
    title: 'Informes y Analítica',
    description: 'Generador de reportes de datos.',
    category: 'Estrategia',
    icon: React.createElement(ChartBarIcon),
    integrations: ['WooCommerce', 'n8n'],
    requiredIntegrations: [...MAKE_WEBHOOK],
    price: 149,
  },
  {
    id: '18_formacion_onboarding',
    title: 'Formación y Onboarding',
    description: 'Guía para nuevos empleados.',
    category: 'Recursos Humanos',
    icon: React.createElement(UserGroupIcon),
    integrations: ['OpenAI'],
    requiredIntegrations: [],
    price: 99,
  },
  {
    id: '19_consultor_negocio_ia',
    title: 'Consultor de Negocio IA',
    description: 'Analista estratégico de ventas.',
    category: 'Estrategia',
    icon: React.createElement(ChartBarIcon),
    integrations: ['OpenAI'],
    requiredIntegrations: [],
    price: 199,
  },
  {
    id: '20_multicanal_internacional',
    title: 'Multicanal Internacional',
    description: 'Soporte políglota.',
    category: 'Atención al Cliente',
    icon: React.createElement(GlobeAltIcon),
    integrations: ['OpenAI', 'Twilio'],
    requiredIntegrations: [...TWILIO_FIELDS],
    price: 199,
  },
];