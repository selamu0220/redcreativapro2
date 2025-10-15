'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useSimpleTranslations } from '../lib/simple-translations';
import { Instagram, MessageCircle, X } from 'lucide-react';

export default function InstagramDMWidget() {
  const { t } = useSimpleTranslations();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      {/* Widget minimizado - solo ícono */}
      {isMinimized ? (
        <div className="fixed bottom-6 left-6 z-[100]">
          <Button
            onClick={() => setIsMinimized(false)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 border-2 border-white/20 animate-pulse hover:animate-none"
          >
            <Instagram className="h-6 w-6 text-white" />
          </Button>
        </div>
      ) : (
        /* Widget expandido */
        <div className="fixed bottom-6 left-6 z-[100] max-w-sm">
          <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="text-white">
                  <p className="font-semibold text-sm">Instagram</p>
                  <p className="text-xs opacity-90">@r_ccprk</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 bg-background">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-2 flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('haveQuestions')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('dmWidgetDescription')}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="https://www.instagram.com/r_ccprk/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  {t('sendDM')}
                </Button>
              </a>

              {/* Close option */}
              <button
                onClick={() => setIsVisible(false)}
                className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('closeWidget')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

