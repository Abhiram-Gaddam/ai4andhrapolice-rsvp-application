"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, HelpCircle, Info } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/admin",
      label: "Admin",
      icon: Users,
    },
    {
      href: "/about",
      label: "About",
      icon: Info,
    },
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            RSVP System
          </Link>

          <div className="flex space-x-4">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href

              return (
                <Link key={route.href} href={route.href}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{route.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
