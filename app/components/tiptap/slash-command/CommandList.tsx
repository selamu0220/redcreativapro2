import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandItemProps } from './CommandList' // Self reference or just interface

export interface CommandItemProps {
    title: string
    icon: any
    command: (editor: any) => void
}

interface CommandListProps {
    items: CommandItemProps[]
    command: any
    editor: any
    range: any
}

const CommandList = forwardRef((props: CommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = useCallback(
        (index: number) => {
            const item = props.items[index]
            if (item) {
                props.command(item)
            }
        },
        [props]
    )

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault()
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
                return true
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault()
                setSelectedIndex((selectedIndex + 1) % props.items.length)
                return true
            }
            if (event.key === 'Enter') {
                event.preventDefault()
                selectItem(selectedIndex)
                return true
            }
            return false
        },
    }))

    // Grouping Logic
    const groups = [
        { name: 'IA & Magia', filter: (t: string) => t.includes('IA') || t.includes('Continuar') },
        { name: 'Estructura', filter: (t: string) => t.includes('Título') },
        { name: 'Formato', filter: (t: string) => t.includes('Lista') || t.includes('Cita') || t.includes('Código') || t.includes('Tarea') },
        { name: 'Plantillas', filter: (t: string) => t.includes('Plantilla') },
        { name: 'Otros', filter: (t: string) => true } // Fallback
    ];

    // We can't easily reorder the props.items because the index logic relies on the flat list order passed by Tiptap logic.
    // Changing the order here would break the connection between selectedIndex and the rendered item if we are not careful.
    // Strategy: Render flat list but insert "Headers" visually?
    // OR: Just make the list beautiful and don't reorder.
    // Reordering is risky because `onKeyDown` uses `props.items`.
    // If I render in a different order, the arrow keys will jump around visually compared to the internal array index.

    // Solution: Keep the flat list, but styled nicer. 
    // Maybe show a "Category" badge on the right?

    const getCategory = (title: string) => {
        if (title.includes('IA')) return 'IA';
        if (title.includes('Plantilla')) return 'Plantilla';
        if (title.includes('Título')) return 'Estructura';
        return 'Formato';
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-50 min-w-[320px] max-w-[400px] max-h-[400px] overflow-y-auto rounded-xl border border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl p-2 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-white/10 mb-1 flex justify-between">
                <span>Comandos</span>
                <span className="opacity-50">TAB para navegar</span>
            </div>

            {props.items.length ? (
                props.items.map((item, index) => {
                    const isSelected = index === selectedIndex
                    return (
                        <button
                            key={index}
                            className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-all duration-200 w-full text-left group
                                ${isSelected ? 'bg-primary/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-muted-foreground hover:bg-white/10 hover:text-white'}
                            `}
                            onClick={() => selectItem(index)}
                            onMouseEnter={() => setSelectedIndex(index)} // Mouse follow
                        >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200
                                ${isSelected ? 'bg-primary text-white border-primary/50' : 'bg-white/5 border-white/10 text-muted-foreground group-hover:border-white/30'}
                            `}>
                                <item.icon className="w-4 h-4" />
                            </div>

                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className={`truncate font-medium ${isSelected ? 'text-white' : ''}`}>{item.title}</span>
                                {/* <span className="text-[10px] text-muted-foreground truncate">Descripción corta si tuviera...</span> */}
                            </div>

                            <div className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-muted-foreground/70 uppercase">
                                {getCategory(item.title)}
                            </div>
                        </button>
                    )
                })
            ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>No se encontraron resultados</p>
                </div>
            )}
        </motion.div>
    )
})

CommandList.displayName = 'CommandList'

export default CommandList
