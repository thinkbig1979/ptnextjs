"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationItem {
  href: string;
  label: string;
  submenu?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    href: "/discovery-platform",
    label: "Discovery Platform",
    submenu: [
      { href: "/vendors", label: "Vendors" },
      { href: "/products", label: "Products & Services" },
      { href: "/yachts", label: "Yachts" },
      { href: "/info-for-vendors", label: "Info For Vendors" },
      { href: "/vendor/login", label: "Vendor Login" },
    ]
  },
  { href: "/bespoke-solutions", label: "Bespoke Solutions" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActiveItem = (item: NavigationItem) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(subItem => pathname === subItem.href);
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 sm:h-24 md:h-22 lg:h-26 max-w-screen-xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Logo size="mobile-nav" priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <div key={item.href}>
              {item.submenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-poppins-medium text-sm transition-colors hover:text-accent h-auto p-2",
                        isActiveItem(item)
                          ? "text-accent"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {item.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link
                        href={item.href}
                        className="w-full cursor-pointer"
                      >
                        {item.label} Overview
                      </Link>
                    </DropdownMenuItem>
                    {item.submenu.map((subItem) => (
                      <DropdownMenuItem key={subItem.href} asChild>
                        <Link
                          href={subItem.href}
                          className="w-full cursor-pointer"
                        >
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "font-poppins-medium text-sm transition-colors hover:text-accent",
                    pathname === item.href
                      ? "text-accent"
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "font-poppins-medium text-lg transition-colors hover:text-accent block",
                        isActiveItem(item)
                          ? "text-accent"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.submenu && (
                      <div className="ml-4 mt-2 space-y-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "font-poppins-light text-base transition-colors hover:text-accent block",
                              pathname === subItem.href
                                ? "text-accent"
                                : "text-foreground/60 hover:text-foreground"
                            )}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}