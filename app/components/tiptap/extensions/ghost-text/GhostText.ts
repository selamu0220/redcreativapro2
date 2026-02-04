import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        ghostText: {
            setGhostText: (text: string) => ReturnType
            acceptGhostText: () => ReturnType
            clearGhostText: () => ReturnType
        }
    }
}

export const GhostText = Extension.create({
    name: 'ghostText',

    addOptions() {
        return {
            className: 'ghost-text-placeholder',
        }
    },

    addStorage() {
        return {
            text: null as string | null,
        }
    },

    addCommands() {
        return {
            setGhostText: (text: string) => ({ editor, dispatch }) => {
                editor.storage.ghostText.text = text
                if (dispatch) {
                    // Force re-render of decorations
                    editor.view.dispatch(editor.state.tr)
                }
                return true
            },
            clearGhostText: () => ({ editor, dispatch }) => {
                // Only trigger update if there was text
                if (editor.storage.ghostText.text) {
                    editor.storage.ghostText.text = null
                    if (dispatch) {
                        editor.view.dispatch(editor.state.tr)
                    }
                    return true
                }
                return false
            },
            acceptGhostText: () => ({ editor, commands }) => {
                const text = editor.storage.ghostText.text
                if (text) {
                    commands.insertContent(text)
                    commands.clearGhostText()
                    return true
                }
                return false
            },
        }
    },

    addKeyboardShortcuts() {
        return {
            'Tab': () => {
                if (this.editor.storage.ghostText.text) {
                    return this.editor.commands.acceptGhostText()
                }
                return false
            },
            'Escape': () => {
                if (this.editor.storage.ghostText.text) {
                    return this.editor.commands.clearGhostText()
                }
                return false
            }
        }
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('ghostText'),
                props: {
                    decorations: (state) => {
                        const { text } = this.editor.storage.ghostText
                        if (!text) return DecorationSet.empty

                        const { doc, selection } = state
                        // Only show if selection is a cursor (empty)
                        if (!selection.empty) return DecorationSet.empty

                        const pos = selection.$head.pos;

                        const decoration = Decoration.widget(pos, () => {
                            const span = document.createElement('span')
                            span.classList.add(this.options.className)
                            span.textContent = text
                            span.style.opacity = '0.3'
                            span.style.pointerEvents = 'none'
                            span.style.fontStyle = 'italic'
                            span.setAttribute('data-content', text)
                            return span
                        }, { side: 1 }) // Appears after cursor

                        return DecorationSet.create(doc, [decoration])
                    },
                    // Clear ghost text on any other content-changing interaction
                    handleKeyDown: (view, event) => {
                        // Allowed keys that don't modify content directly or we want to support
                        if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                            return false;
                        }
                        // For any typing, clear the ghost text
                        if (this.editor.storage.ghostText.text) {
                            this.editor.commands.clearGhostText()
                        }
                        return false
                    }
                },
            }),
        ]
    },
})
