"use client"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  PanelLeft,
  Search,
  History,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { usePathname } from 'next/navigation'
import React from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        </div>
    )
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const breadcrumbSegment = capitalize(pathname.split('/').pop() || 'Dashboard');

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-all group-hover:scale-110">
                <path d="M4.5 15.5L3 21"></path>
                <path d="M19.5 15.5L21 21"></path>
                <path d="M13 8.5c0-2.5-1.5-4-3.5-4s-3.5 1.5-3.5 4"></path>
                <path d="M12.5 11.5L14 15.5H5L6.5 11.5Z"></path>
                <path d="M18 11.5c0-2.5-1.5-4-3.5-4"></path>
                <path d="M17.5 11.5L19 15.5"></path>
            </svg>
            <span className="sr-only">Camal</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname === '/dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/team"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname.startsWith('/dashboard/team') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Team</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Team</TooltipContent>
            </Tooltip>
             {user.role === 'manager' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/history"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname.startsWith('/dashboard/history') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <History className="h-5 w-5" />
                    <span className="sr-only">Task History</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Task History</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-all group-hover:scale-110">
                      <path d="M4.5 15.5L3 21"></path>
                      <path d="M19.5 15.5L21 21"></path>
                      <path d="M13 8.5c0-2.5-1.5-4-3.5-4s-3.5 1.5-3.5 4"></path>
                      <path d="M12.5 11.5L14 15.5H5L6.5 11.5Z"></path>
                      <path d="M18 11.5c0-2.5-1.5-4-3.5-4"></path>
                      <path d="M17.5 11.5L19 15.5"></path>
                  </svg>
                  <span className="sr-only">Camal</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-4 px-2.5 ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/team"
                  className={`flex items-center gap-4 px-2.5 ${pathname.startsWith('/dashboard/team') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Users className="h-5 w-5" />
                  Team
                </Link>
                {user.role === 'manager' && (
                  <Link
                    href="/dashboard/history"
                    className={`flex items-center gap-4 px-2.5 ${pathname.startsWith('/dashboard/history') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <History className="h-5 w-5" />
                    Task History
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathname !== '/dashboard' && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbSegment}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search input is now on dashboard page */}
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
            {children}
        </main>
      </div>
    </div>
  )
}
