'use client'

import React from 'react'
import { useThemeStyle, ThemeStyle, THEME_STYLES } from '@/app/contexts/ThemeStyleContext'
import { Check, Palette, Brush, Zap, Sun } from 'lucide-react'

interface ThemePickerProps {
    compact?: boolean
    onSelect?: (theme: ThemeStyle) => void
    showDescriptions?: boolean
}

const themeIcons: Record<ThemeStyle, React.ReactNode> = {
    minimal: <Palette className="w-5 h-5" />,
    notebook: <Brush className="w-5 h-5" />,
    'neo-brutalism': <Zap className="w-5 h-5" />,
    claude: <Sun className="w-5 h-5" />,
}

export function ThemePicker({ compact = false, onSelect, showDescriptions = true }: ThemePickerProps) {
    const { themeStyle, setThemeStyle, themes } = useThemeStyle()

    const handleSelect = (id: ThemeStyle) => {
        setThemeStyle(id)
        onSelect?.(id)
    }

    if (compact) {
        return (
            <div className="flex gap-2">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleSelect(theme.id)}
                        className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              ${themeStyle === theme.id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }
            `}
                        title={theme.name}
                    >
                        <div className="flex gap-1">
                            {Object.values(theme.previewColors).slice(0, 3).map((color, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 rounded-full border border-black/10"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        {themeStyle === theme.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => handleSelect(theme.id)}
                    className={`
            relative p-4 rounded-xl border-2 text-left transition-all duration-300
            hover:scale-[1.02] hover:shadow-lg
            ${themeStyle === theme.id
                            ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }
          `}
                >
                    {/* Theme Preview */}
                    <div
                        className="h-24 rounded-lg mb-3 p-3 relative overflow-hidden border"
                        style={{ backgroundColor: theme.previewColors.background }}
                    >
                        {/* Preview UI mockup */}
                        <div className="flex gap-2 mb-2">
                            <div
                                className="h-2 w-16 rounded-full"
                                style={{ backgroundColor: theme.previewColors.primary }}
                            />
                            <div
                                className="h-2 w-8 rounded-full"
                                style={{ backgroundColor: theme.previewColors.secondary }}
                            />
                        </div>
                        <div
                            className="h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: theme.previewColors.primary }}
                        >
                            <span
                                className="text-xs font-medium"
                                style={{ color: theme.previewColors.background }}
                            >
                                Botón
                            </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <div
                                className="h-3 flex-1 rounded"
                                style={{ backgroundColor: theme.previewColors.secondary }}
                            />
                            <div
                                className="h-3 w-8 rounded"
                                style={{ backgroundColor: theme.previewColors.accent }}
                            />
                        </div>

                        {/* Color swatches */}
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            {Object.values(theme.previewColors).map((color, i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-black/20"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Theme Info */}
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                            {themeIcons[theme.id]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{theme.name}</h3>
                                {themeStyle === theme.id && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                        Activo
                                    </span>
                                )}
                            </div>
                            {showDescriptions && (
                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                    {theme.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Selection indicator */}
                    {themeStyle === theme.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    )
}

export default ThemePicker
