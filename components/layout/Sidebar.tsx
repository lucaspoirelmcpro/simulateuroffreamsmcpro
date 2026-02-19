'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard, Layers, BarChart2, Settings, Users,
  Building2, LogOut, ChevronDown, Keyboard, RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/pipeline', label: 'Pipeline', icon: Layers, shortcut: 'G P' },
  { href: '/analytics', label: 'Analytics', icon: BarChart2, shortcut: 'G A' },
  { href: '/admin/pipeline', label: 'Admin Pipeline', icon: Settings, shortcut: null, role: 'ADMIN' },
]

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname()
  const user = session.user

  return (
    <TooltipProvider>
      <aside className="w-14 flex flex-col items-center py-3 border-r border-border bg-background shrink-0 h-full">
        {/* Logo */}
        <Link href="/pipeline" className="mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">SC</span>
          </div>
        </Link>

        <div className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.label}
                  {item.shortcut && (
                    <kbd className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* User avatar + menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-auto">
              <Avatar className="h-8 w-8 hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                  {getInitials(user.name ?? user.email ?? '?')}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Intégrations
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </TooltipProvider>
  )
}
