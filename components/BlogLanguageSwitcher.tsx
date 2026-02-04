'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BlogLanguageSwitcherProps {
    currentLang: string
    slugs: Record<string, string> // lang -> slug
}

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' }
]

export default function BlogLanguageSwitcher({ currentLang, slugs }: BlogLanguageSwitcherProps) {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <Globe className="w-4 h-4" />
                    <span className="uppercase">{currentLang}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => {
                    const slug = slugs[lang.code]
                    const isActive = currentLang === lang.code

                    // Construct URL: 
                    // If lang is 'en', no prefix -> /blog/slug
                    // If lang is 'es', prefix -> /es/blog/slug
                    const href = slug
                        ? (lang.code === 'en' ? `/blog/${slug}` : `/${lang.code}/blog/${slug}`)
                        : '#' // Disable if no translation exists

                    return (
                        <DropdownMenuItem key={lang.code} asChild disabled={!slug}>
                            <Link href={href} className={`flex items-center gap-2 cursor-pointer ${isActive ? 'bg-primary/10 text-primary' : ''}`}>
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
