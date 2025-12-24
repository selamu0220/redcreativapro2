'use client'

import { useState, useEffect } from 'react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, X } from 'lucide-react'
import { ModeToggle } from './ModeToggle'

export function SimpleMainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) {
    return (
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RC</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Red Creativa Pro</span>
          </Link>
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RC</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Red Creativa Pro</span>
          <Badge variant="outline" className="ml-2 font-mono text-[10px] uppercase tracking-wider">BETA</Badge>
        </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/planes">Membresía</Link>
            </Button>
            
            <div className="h-4 w-[1px] bg-border mx-2" />

              {isSignedIn ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <div className="ml-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="default" size="sm" className="ml-2">
                    Iniciar Sesión
                  </Button>
                </SignInButton>
              )}
              
              <div className="ml-2">
                <ModeToggle />
              </div>
            </nav>


          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t bg-background p-4 flex flex-col space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Button variant="ghost" className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/planes">Membresía</Link>
            </Button>
            
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium">Tema</span>
              <ModeToggle />
            </div>

            {isSignedIn ? (
              <Button variant="ghost" className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full justify-start mt-2">
                  Iniciar Sesión
                </Button>
              </SignInButton>
            )}
          </nav>
        )}
    </header>
  )
}
