"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Menu, ChevronDown } from "lucide-react";

// Type definitions for navigation items
type NavItemSimple = {
  href: string;
  label: string;
  children?: never;
};

type NavItemWithChildren = {
  label: string;
  href?: never;
  children: { href: string; label: string }[];
};

type NavItem = NavItemSimple | NavItemWithChildren;

const navigationItems: NavItem[] = [
  { href: "/", label: "Home" },
  {
    label: "Custom Lighting",
    children: [
      { href: "/custom-lighting", label: "Overview" },
      { href: "/custom-lighting/products", label: "Products" },
      { href: "/custom-lighting/services", label: "Services" },
      { href: "/custom-lighting/applications", label: "Applications" },
    ],
  },
  {
    label: "Consultancy",
    children: [
      { href: "/consultancy", label: "Overview" },
      { href: "/consultancy/clients", label: "For Project Teams" },
      { href: "/consultancy/suppliers", label: "For Industry Suppliers" },
    ],
  },
  {
    label: "Industry Directory",
    children: [
      { href: "/vendors", label: "Vendors" },
      { href: "/products", label: "Products" },
      { href: "/yachts", label: "Yachts" },
    ],
  },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-12 w-48 bg-muted animate-pulse rounded" />;
  }

  const currentTheme = resolvedTheme || theme;
  const logoSrc =
    currentTheme === "dark"
      ? "/media/company/logos/Paul-Thames-logo-PNG-white.png"
      : "/media/company/logos/Paul-Thames-logo-PNG-black.png";

  return (
    <div className="relative h-12 w-48">
      <Image
        src={logoSrc}
        alt="Paul Thames"
        fill
        className="object-contain"
        priority
        sizes="192px"
      />
    </div>
  );
}

// Check if the current path is active for a navigation item or any of its children
function isNavItemActive(
  pathname: string,
  item: NavItem
): boolean {
  if (item.children) {
    return item.children.some(
      (child) =>
        pathname === child.href || pathname.startsWith(child.href + "/")
    );
  }
  // For simple items, exact match only for home, startsWith for others
  if (item.href === "/") {
    return pathname === "/";
  }
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

// Desktop Navigation Link Item (for items without dropdowns)
function DesktopNavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-poppins-medium text-sm transition-colors hover:text-accent px-3 py-2",
        isActive ? "text-accent" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

// Desktop Navigation with dropdown menus
function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="space-x-1">
        {navigationItems.map((item) => {
          const isActive = isNavItemActive(pathname, item);

          if (item.children) {
            // Item with dropdown
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  className={cn(
                    "font-poppins-medium text-sm bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                    isActive
                      ? "text-accent"
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-1 p-2">
                    {item.children.map((child) => {
                      const isChildActive =
                        pathname === child.href ||
                        pathname.startsWith(child.href + "/");
                      return (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.href}
                              className={cn(
                                "block select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isChildActive
                                  ? "bg-accent/10 text-accent font-poppins-medium"
                                  : "font-poppins-medium"
                              )}
                            >
                              {child.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          // Simple item without dropdown
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <DesktopNavLink
                  href={item.href}
                  label={item.label}
                  isActive={isActive}
                />
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// Mobile Navigation Link
function MobileNavLink({
  href,
  label,
  isActive,
  onClick,
  isChild = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isChild?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "font-poppins-medium transition-colors hover:text-accent block",
        isChild ? "text-base py-2 pl-4" : "text-lg py-2",
        isActive ? "text-accent" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

// Mobile Collapsible Navigation Section
function MobileNavSection({
  item,
  pathname,
  onLinkClick,
}: {
  item: NavItemWithChildren;
  pathname: string;
  onLinkClick: () => void;
}) {
  const isActive = isNavItemActive(pathname, item);
  const [isOpen, setIsOpen] = React.useState(isActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center justify-between w-full font-poppins-medium text-lg py-2 transition-colors hover:text-accent",
          isActive ? "text-accent" : "text-foreground/80 hover:text-foreground"
        )}
        aria-expanded={isOpen}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1">
        <div className="border-l-2 border-muted ml-2 mt-1 mb-2">
          {item.children.map((child) => {
            const isChildActive =
              pathname === child.href ||
              pathname.startsWith(child.href + "/");
            return (
              <MobileNavLink
                key={child.href}
                href={child.href}
                label={child.label}
                isActive={isChildActive}
                onClick={onLinkClick}
                isChild
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Mobile Navigation (Sheet)
function MobileNavigation({
  pathname,
  isOpen,
  setIsOpen,
}: {
  pathname: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const handleLinkClick = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-2 mt-8" aria-label="Mobile navigation">
          {navigationItems.map((item) => {
            if (item.children) {
              return (
                <MobileNavSection
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onLinkClick={handleLinkClick}
                />
              );
            }

            const isActive = isNavItemActive(pathname, item);
            return (
              <MobileNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActive}
                onClick={handleLinkClick}
              />
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNavigation pathname={pathname} />

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Mobile Navigation */}
          <MobileNavigation
            pathname={pathname}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>
    </header>
  );
}
