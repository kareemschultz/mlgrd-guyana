"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ministry, mainNav, utilityNav } from "@/lib/site";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-ink text-ink-foreground md:block">
        <div className="container-gov flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${ministry.phone}`} className="flex items-center gap-1.5 hover:text-gold">
              <Phone className="size-3.5" /> {ministry.phone}
            </a>
            <a href={`mailto:${ministry.email}`} className="flex items-center gap-1.5 hover:text-gold">
              <Mail className="size-3.5" /> {ministry.email}
            </a>
          </div>
          <nav className="flex items-center gap-4">
            {utilityNav.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gold">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "border-border bg-background/85 shadow-sm backdrop-blur-md"
            : "border-transparent bg-background"
        )}
      >
        <div className="container-gov flex h-16 items-center justify-between gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) =>
              item.children ? (
                <DirectoriesMenu key={item.label} pathname={pathname} />
              ) : (
                <NavTopLink key={item.href} href={item.href} active={isActive(pathname, item.href)}>
                  {item.label}
                </NavTopLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden bg-brand-600 hover:bg-brand-700 sm:inline-flex">
              <Link href="/services/reporting-local-problems">Report a Problem</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88%] max-w-sm overflow-y-auto p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {mainNav.map((item) =>
                      item.children ? (
                        <AccordionItem key={item.label} value={item.label} className="border-b">
                          <AccordionTrigger className="py-3 text-base font-semibold">
                            {item.label}
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="flex flex-col gap-1 pl-2">
                              {item.children.map((c) => (
                                <Link
                                  key={c.href}
                                  href={c.href}
                                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                  {c.label}
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center justify-between border-b py-3 text-base font-semibold"
                        >
                          {item.label}
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </Link>
                      )
                    )}
                  </Accordion>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {utilityNav.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <Button asChild className="mt-4 w-full bg-brand-600 hover:bg-brand-700">
                    <Link href="/services/reporting-local-problems">Report a Problem</Link>
                  </Button>
                  <div className="mt-5 space-y-1 border-t pt-4 text-sm text-muted-foreground">
                    <a href={`tel:${ministry.phone}`} className="flex items-center gap-2">
                      <Phone className="size-4" /> {ministry.phone}
                    </a>
                    <a href={`mailto:${ministry.email}`} className="flex items-center gap-2">
                      <Mail className="size-4" /> {ministry.email}
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavTopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "text-brand-600" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-brand transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}

/** Directories mega-menu (hover/focus dropdown). */
function DirectoriesMenu({ pathname }: { pathname: string }) {
  const item = mainNav.find((i) => i.children)!;
  const active = item.children!.some((c) => isActive(pathname, c.href));
  return (
    <div className="group relative">
      <button
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "text-brand-600" : "text-foreground/80 hover:text-foreground"
        )}
      >
        {item.label}
        <ChevronRight className="size-3.5 rotate-90 transition-transform group-hover:rotate-[270deg]" />
      </button>
      <div className="invisible absolute left-0 top-full w-80 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-xl border bg-popover p-2 shadow-xl">
          {item.children!.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
            >
              <span className="text-sm font-semibold text-foreground">{c.label}</span>
              {c.description && (
                <span className="text-xs text-muted-foreground">{c.description}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
