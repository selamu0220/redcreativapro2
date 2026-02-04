'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, Check, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

// Configuration
const LANGUAGES = [
    { code: 'es', name: 'Español', flag: '🇪🇸' }, // Spanish is the source
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export default function GoogleTranslate() {
    const [currentLang, setCurrentLang] = useState('es');
    const [isLoaded, setIsLoaded] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // --- Cookie Helpers ---
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const setCookie = (name: string, value: string, domain: string) => {
        document.cookie = `${name}=${value}; domain=${domain}; path=/; max-age=31536000`; // 1 year
    };

    const clearCookie = (name: string, domain?: string) => {
        if (domain) {
            document.cookie = `${name}=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            document.cookie = `${name}=; domain=.${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    };

    // --- Initialization ---
    useEffect(() => {
        // 1. Read initial state from cookie
        const cookie = getCookie('googtrans');
        if (cookie) {
            const parts = cookie.split('/');
            const target = parts[2];
            if (target && LANGUAGES.some(l => l.code === target)) {
                setCurrentLang(target);
            }
        }

        // 2. Setup Google Translate
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'es',
                    includedLanguages: 'es,en,fr,de,pt',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                'google_translate_element'
            );
            setIsLoaded(true);
            setInitializing(false);
        };

        // 3. Load Script if missing
        if (!document.querySelector('#google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            setIsLoaded(true);
            setInitializing(false);
        }

        // 4. Polling to detect changes and enforce styles
        const interval = setInterval(() => {
            const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (googleSelect && getCookie('googtrans')) {
                const cookieVal = getCookie('googtrans');
                // Optional state cleanup if needed
            }

            // Force hide banner and reset body top
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) {
                banner.setAttribute('style', 'display: none !important');
            }

            const body = document.body;
            if (body.style.top && body.style.top !== '0px') {
                body.style.setProperty('top', '0px', 'important');
                body.style.setProperty('position', 'static', 'important');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // --- Change Handler ---
    const handleLanguageChange = (langCode: string) => {
        setCurrentLang(langCode);
        const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        const hostname = window.location.hostname;
        const domainParts = hostname.split('.');
        const rootDomain = domainParts.length > 1
            ? '.' + domainParts.slice(-2).join('.')
            : hostname;

        if (langCode === 'es') {
            // Restore Original (Nuclear Option)
            // 1. Clear cookies for all possible domains
            clearCookie('googtrans');
            clearCookie('googtrans', hostname);
            clearCookie('googtrans', '.' + hostname);
            clearCookie('googtrans', rootDomain);

            // 2. Attempt to trigger Google's internal restore
            if (googleSelect) {
                googleSelect.value = ''; // Often triggers reset
                googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 3. Reload to ensure clean state
            // Small timeout to allow cookie deletion to process in all browsers
            setTimeout(() => {
                window.location.reload();
            }, 100);

        } else {
            // Switch Language
            // 1. Set cookie explicitly
            setCookie('googtrans', `/es/${langCode}`, hostname);
            setCookie('googtrans', `/es/${langCode}`, '.' + hostname);
            setCookie('googtrans', `/es/${langCode}`, rootDomain); // Also set on root

            // 2. Trigger DOM event
            if (googleSelect) {
                googleSelect.value = langCode;
                googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                window.location.reload();
            }
        }
    };

    const selectedLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    return (
        <div className="relative z-50">
            {/* Hidden Standard Widget */}
            {/* We use visibility:hidden to keep it in DOM but invisible */}
            <div
                id="google_translate_element"
                className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none"
                aria-hidden="true"
            />

            {/* Custom UI */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 gap-2 min-w-[140px] justify-between text-white/90"
                    >
                        {initializing ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin opacity-70" />
                                <span className="text-sm">Loading...</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="text-base leading-none">{selectedLang.flag}</span>
                                <span className="text-sm font-medium">{selectedLang.name}</span>
                            </span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px] bg-[#1a1b1e] border-white/10 text-gray-200">
                    {LANGUAGES.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                "cursor-pointer flex items-center gap-3 px-3 py-2.5 focus:bg-white/10 focus:text-white",
                                currentLang === lang.code && "bg-white/5 text-purple-400 font-medium"
                            )}
                        >
                            <span className="text-base leading-none">{lang.flag}</span>
                            <span className="flex-1">{lang.name}</span>
                            {currentLang === lang.code && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Global Styles to force-hide Google's UI artifacts which often inject themselves into body */}
            <style jsx global>{`
                /* Hide the banner frame */
                .goog-te-banner-frame { display: none !important; }
                iframe.goog-te-banner-frame { display: none !important; }
                
                /* Hide the gadget icon */
                .goog-te-gadget-icon { display: none !important; }
                
                /* Ensure the container is invisible */
                #google_translate_element { width: 0px; height: 0px; overflow: hidden; display: none; }
                
                /* Reset body position */
                body { top: 0px !important; position: static !important; }
                
                /* Hide tooltips and popups */
                .goog-tooltip { display: none !important; }
                .goog-te-gadget-simple { display: none !important; }
                #goog-gt-tt { display: none !important; visibility: hidden !important; }
                
                /* Hide the specific banner structure often used in new versions */
                .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
                .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }
                
                /* General hiding of google translate artifacts */
                .skiptranslate > iframe { display: none !important; }
                body > .skiptranslate { display: none !important; }
            `}</style>
        </div>
    );
}
