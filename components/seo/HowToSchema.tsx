/**
 * HowTo Schema Component
 * 
 * Generates structured data for HowTo schema to improve SEO
 * for tutorial and guide content in blog posts
 */

interface HowToStep {
    name: string
    text: string
    image?: string
}

interface HowToSchemaProps {
    name: string
    description: string
    totalTime?: string // ISO 8601 duration format, e.g., "PT30M" for 30 minutes
    estimatedCost?: {
        currency: string
        value: string
    }
    supply?: string[]
    tool?: string[]
    steps: HowToStep[]
    image?: string
    baseUrl?: string
}

export function HowToSchema({
    name,
    description,
    totalTime,
    estimatedCost,
    supply,
    tool,
    steps,
    image,
    baseUrl = 'https://www.redcreativa.pro'
}: HowToSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        ...(image && { image }),
        ...(totalTime && { totalTime }),
        ...(estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: estimatedCost.currency,
                value: estimatedCost.value
            }
        }),
        ...(supply && supply.length > 0 && {
            supply: supply.map(item => ({
                '@type': 'HowToSupply',
                name: item
            }))
        }),
        ...(tool && tool.length > 0 && {
            tool: tool.map(item => ({
                '@type': 'HowToTool',
                name: item
            }))
        }),
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: step.image })
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

/**
 * Pre-built HowTo schemas for common tutorials
 */
export const PRESET_HOWTO_SCHEMAS = {
    writeArticleAI: {
        name: 'Cómo escribir un artículo optimizado para SEO con IA',
        description: 'Guía paso a paso para crear contenido de blog optimizado para buscadores usando herramientas de escritura con inteligencia artificial.',
        totalTime: 'PT20M',
        tool: ['Red Creativa Pro', 'Navegador web'],
        steps: [
            {
                name: 'Acceder al escritor IA',
                text: 'Ve a redcreativa.pro/escritor-ia e inicia sesión con tu cuenta de Google.'
            },
            {
                name: 'Elegir el tema y palabras clave',
                text: 'Define el tema principal de tu artículo y las palabras clave objetivo que quieres posicionar.'
            },
            {
                name: 'Generar estructura con IA',
                text: 'Usa el asistente de IA para generar una estructura de encabezados H2 y H3 optimizada para SEO.'
            },
            {
                name: 'Desarrollar cada sección',
                text: 'Escribe o genera contenido para cada sección, manteniendo la densidad de palabras clave entre 1-2%.'
            },
            {
                name: 'Activar modo Stealth',
                text: 'Usa el modo Stealth para humanizar el texto y evitar detección de IA, manteniendo tu voz natural.'
            },
            {
                name: 'Revisar puntuación SEO',
                text: 'Verifica que la puntuación SEO sea superior a 80 antes de publicar. Ajusta meta título y descripción.'
            }
        ]
    },

    improveExistingText: {
        name: 'Cómo mejorar un texto existente con IA',
        description: 'Tutorial para optimizar y mejorar textos que ya tienes escritos usando el corrector de IA de Red Creativa Pro.',
        totalTime: 'PT10M',
        tool: ['Red Creativa Pro Corrector', 'Texto a mejorar'],
        steps: [
            {
                name: 'Acceder al corrector',
                text: 'Navega a redcreativa.pro/corrector-textos-ia desde cualquier dispositivo.'
            },
            {
                name: 'Pegar el texto original',
                text: 'Copia y pega el texto que quieres mejorar en el editor principal.'
            },
            {
                name: 'Seleccionar tipo de mejora',
                text: 'Elige entre mejora de gramática, estilo, SEO o claridad según tus necesidades.'
            },
            {
                name: 'Revisar sugerencias',
                text: 'Examina las sugerencias de la IA y acepta las que consideres apropiadas.'
            },
            {
                name: 'Exportar resultado',
                text: 'Descarga el texto corregido en el formato que prefieras: texto plano, Markdown o HTML.'
            }
        ]
    },

    createEmailCampaign: {
        name: 'Cómo crear emails de marketing efectivos con IA',
        description: 'Aprende a generar correos electrónicos de alto rendimiento para tus campañas de email marketing.',
        totalTime: 'PT15M',
        tool: ['Red Creativa Pro Correos IA', 'Lista de destinatarios'],
        steps: [
            {
                name: 'Definir objetivo del email',
                text: 'Determina si el email es para nutrir leads, promocionar un producto, o recuperar clientes inactivos.'
            },
            {
                name: 'Configurar tono y estilo',
                text: 'Selecciona el tono apropiado: profesional, cercano, urgente, o informativo.'
            },
            {
                name: 'Generar líneas de asunto',
                text: 'Pide a la IA múltiples variantes de asunto y elige la que tenga mayor potencial de apertura.'
            },
            {
                name: 'Crear cuerpo del mensaje',
                text: 'Genera el contenido principal con llamada a la acción clara y beneficios concretos.'
            },
            {
                name: 'Personalizar con variables',
                text: 'Añade tokens de personalización como {nombre} o {empresa} para aumentar la relevancia.'
            }
        ]
    }
}
