'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { Button } from '@/app/components/ui/button'
import { User, LogOut, Settings, CreditCard } from 'lucide-react'

export function CustomUserMenu() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()

    if (!user) return null

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2 p-0 overflow-hidden border">
                    {/* Fallback to simple image if Avatar component is missing */}
                    <img
                        src={user.imageUrl}
                        alt={user.fullName || 'User'}
                        className="h-full w-full object-cover"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    {/* Link to Clerk Account Portal via new subdomains */}
                    <Link href="https://accounts.redcreativa.pro/user" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Gestionar Cuenta</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/planes" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Suscripción</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
