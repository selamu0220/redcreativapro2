import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Heading1, Heading2, Heading3, List, ListOrdered, TextQuote, Code2, Image, Sparkles, CheckSquare, FileText, Mail, Rocket } from 'lucide-react'
import CommandList from './CommandList'

export default {
    items: ({ query }: { query: string }) => {
        return [
            {
                title: 'Título 1',
                icon: Heading1,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
                },
            },
            {
                title: 'Título 2',
                icon: Heading2,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
                },
            },
            {
                title: 'Título 3',
                icon: Heading3,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
                },
            },
            {
                title: 'Lista con viñetas',
                icon: List,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run()
                },
            },
            {
                title: 'Lista numerada',
                icon: ListOrdered,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run()
                },
            },
            {
                title: 'Cita',
                icon: TextQuote,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run()
                },
            },
            {
                title: 'Código',
                icon: Code2,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
                },
            },
            {
                title: 'Tarea (Check)',
                icon: CheckSquare,
                command: ({ editor, range }: any) => {
                    // Requires taskList extension, checking if available or just fallback to list
                    try {
                        editor.chain().focus().deleteRange(range).toggleTaskList().run()
                    } catch (e) {
                        editor.chain().focus().deleteRange(range).toggleBulletList().run()
                    }
                },
            },
            {
                title: 'IA: Continuar escribiendo',
                icon: Sparkles,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).run();
                    const event = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        metaKey: true,
                        bubbles: true,
                        cancelable: true,
                    });
                    editor.view.dom.dispatchEvent(event);
                },
            },
            {
                title: 'Plantilla: Artículo de Blog',
                icon: FileText,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range)
                        .setNode('heading', { level: 1 }).insertContent('Título Impactante del Post')
                        .setNode('paragraph').insertContent('Introducción breve que enganche al lector...')
                        .setNode('heading', { level: 2 }).insertContent('1. El Problema Principal')
                        .setNode('paragraph').insertContent('Describe el problema aquí...')
                        .setNode('heading', { level: 2 }).insertContent('2. La Solución')
                        .setNode('paragraph').insertContent('Explica cómo resolverlo...')
                        .setNode('heading', { level: 3 }).insertContent('Beneficios Clave')
                        .toggleBulletList().insertContent('Beneficio 1').splitListItem('listItem').insertContent('Beneficio 2')
                        .setNode('paragraph').insertContent('Conclusión y llamada a la acción.')
                        .run();
                },
            },
            {
                title: 'Plantilla: Email en Frío',
                icon: Mail,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range)
                        .insertContent('Asunto: [Idea para tu negocio / Pregunta rápida]')
                        .setNode('paragraph').insertContent('Hola [Nombre],')
                        .setNode('paragraph').insertContent('Vi que ustedes están trabajando en [Proyecto/Industria] y me llamó la atención...')
                        .setNode('paragraph').insertContent('Te escribo porque ayudamos a empresas como [Empresa] a conseguir [Resultado].')
                        .setNode('paragraph').insertContent('¿Tendrías 10 minutos esta semana para una llamada rápida?')
                        .setNode('paragraph').insertContent('Saludos,\n[Tu Nombre]')
                        .run();
                },
            },
            {
                title: 'Plantilla: Landing Page (AIDA)',
                icon: Rocket,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range)
                        .setNode('heading', { level: 1 }).insertContent('La Propuesta de Valor Única')
                        .setNode('paragraph').insertContent('Subtítulo que explica el beneficio principal claramente.')
                        .setNode('heading', { level: 2 }).insertContent('¿Por qué elegirnos?')
                        .toggleBulletList().insertContent('Característica 1: Beneficio').splitListItem('listItem').insertContent('Característica 2: Beneficio').splitListItem('listItem').insertContent('Característica 3: Beneficio')
                        .setNode('heading', { level: 2 }).insertContent('Testimonios')
                        .toggleBlockquote().insertContent('"Este producto cambió mi vida." - Cliente Satisfecho')
                        .setNode('heading', { level: 2 }).insertContent('Oferta Irresistible')
                        .setNode('paragraph').insertContent('Haz clic aquí para comprar ahora.')
                        .run();
                },
            },
        ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    },

    render: () => {
        let component: any
        let popup: any

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props: any) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()
                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}
