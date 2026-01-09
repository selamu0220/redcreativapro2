'use client'

import Link from 'next/link'
import { AuthAwareNav } from './AuthAwareNav'
import { SimpleLanguageSlider } from './SimpleLanguageSlider'
import { useSimpleTranslations } from '../lib/simple-translations'

export function SharedLayout({ children }: { children: React.ReactNode }) {
    const { t } = useSimpleTranslations()
    return (
        <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                    <div className="mr-4 flex">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
                                <span className="text-background font-bold text-xs">RC</span>
                            </div>
                            <span className="font-bold">Red Creativa Pro</span>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                            <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                {t('blog')}
                            </Link>
                            <Link href="/planes" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                {t('pricing')}
                            </Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <SimpleLanguageSlider className="mr-2" />
                        <AuthAwareNav />
                    </div>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
