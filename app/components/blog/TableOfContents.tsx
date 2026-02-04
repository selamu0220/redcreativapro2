"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { List, ChevronRight } from 'lucide-react';

interface TableOfContentsProps {
  headers?: { id: string; text: string; level: number }[];
  className?: string;
}

export function TableOfContents({ headers: manualHeaders, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [headers, setHeaders] = useState<{ id: string; text: string; level: number }[]>(manualHeaders || []);

  useEffect(() => {
    if (manualHeaders && manualHeaders.length > 0) return;

    // Auto-scan for headers if not provided manually
    const elements = Array.from(document.querySelectorAll('h2, h3'));
    const scannedHeaders = elements.map((elem, index) => {
      // Ensure ID exists
      if (!elem.id) {
        elem.id = `heading-${index}`;
      }
      return {
        id: elem.id,
        text: elem.textContent || '',
        level: Number(elem.tagName.substring(1)),
      };
    });
    setHeaders(scannedHeaders);
  }, [manualHeaders]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headers.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headers]);

  if (headers.length === 0) return null;

  return (
    <nav className={cn(
      "relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
          <List className="w-4 h-4" />
        </div>
        <span className="font-semibold text-white/90 tracking-tight">Contenido</span>
      </div>

      {/* List */}
      <ul className="space-y-1 relative max-h-[65vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        {headers.map(({ id, text, level }) => {
          // Clean text just in case dynamic scanning picks up artifacts
          const cleanText = text.replace(/\*\*/g, '').replace(/__/g, '');

          return (
            <li key={id} style={{ paddingLeft: level === 3 ? '16px' : '0px' }}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveId(id);
                }}
                className={cn(
                  "group flex items-start gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-200 border border-transparent",
                  activeId === id
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/20 font-medium translate-x-1"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span className={cn(
                  "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300",
                  activeId === id ? "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]" : "bg-white/10 group-hover:bg-white/30"
                )} />
                <span className="leading-relaxed line-clamp-2">{cleanText}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Custom Scrollbar Styles injected here directly to ensure they work without global css dependency issues immediately */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </nav>
  );
}
