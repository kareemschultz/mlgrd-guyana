"use client";

/**
 * Admin shell — composed from the shadcn studio dashboard-shell sidebar/header
 * primitives, themed in ministry colours (ink sidebar + gold active states),
 * scoped to /admin via the `.admin-theme` wrapper. Wired to the data layer.
 */
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Newspaper,
  Images,
  Users,
  Network,
  Inbox,
  Settings,
  LogOut,
  HardDrive,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type { GalleryItem, Message, Minister, Post } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OverviewSection } from "@/components/admin/overview-section";
import { PostsSection } from "@/components/admin/posts-section";
import { GallerySection } from "@/components/admin/gallery-section";
import { MinistersSection } from "@/components/admin/ministers-section";
import { DirectorySection } from "@/components/admin/directory-section";
import { MessagesSection } from "@/components/admin/messages-section";
import { SettingsSection } from "@/components/admin/settings-section";

type SectionId =
  | "overview"
  | "posts"
  | "gallery"
  | "ministers"
  | "directory"
  | "messages"
  | "settings";

const NAV: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "posts", label: "Posts", icon: Newspaper },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "ministers", label: "Ministers", icon: Users },
  { id: "directory", label: "Directories", icon: Network },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "settings", label: "Settings", icon: Settings },
];

const LABELS: Record<SectionId, string> = {
  overview: "Overview",
  posts: "News posts",
  gallery: "Gallery",
  ministers: "Ministers & officials",
  directory: "Directories",
  messages: "Inbox",
  settings: "Settings",
};

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = React.useState<SectionId>("overview");

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
  const [ministers, setMinisters] = React.useState<Minister[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const [p, g, m, msg] = await Promise.all([
        data.posts.list(),
        data.gallery.list(),
        data.ministers.list(),
        data.messages.list(),
      ]);
      setPosts(p);
      setGallery(g);
      setMinisters(m);
      setMessages(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const live = data.mode === "live";
  const newMessages = messages.filter((m) => m.status === "new").length;

  function logout() {
    data.auth.logout();
    toast.success("Signed out.");
    onLogout();
  }

  return (
    <div className="admin-theme">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-sidebar-border border-b">
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <LogoMark className="size-7" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-sm font-extrabold tracking-tight text-sidebar-foreground">
                  MLGRD Admin
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/60">
                  Local Government · Guyana
                </span>
              </div>
            </div>
            <Badge
              className={cn(
                "mx-1 mb-1 flex w-fit items-center gap-1.5 border-0 font-medium",
                live
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-gold/20 text-gold",
              )}
            >
              {live ? (
                <Cloud className="size-3" />
              ) : (
                <HardDrive className="size-3" />
              )}
              {live ? "Live • Cloudflare" : "Local data"}
            </Badge>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={section === item.id}
                          onClick={() => setSection(item.id)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.id === "messages" && newMessages > 0 && (
                          <SidebarMenuBadge className="bg-flag-red text-white">
                            {newMessages}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="bg-card sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 sm:px-6">
            <SidebarTrigger className="[&_svg]:size-5!" />
            <Separator orientation="vertical" className="hidden h-4! sm:block" />
            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1.5 text-sm sm:flex"
            >
              <span className="text-muted-foreground">MLGRD Admin</span>
              <span className="text-muted-foreground/60">/</span>
              <span className="font-medium text-foreground">
                {LABELS[section]}
              </span>
            </nav>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {section === "overview" && (
                  <OverviewSection
                    counts={{
                      posts: posts.length,
                      published: posts.filter((p) => p.status === "published")
                        .length,
                      gallery: gallery.length,
                      ministers: ministers.length,
                      newMessages,
                      totalMessages: messages.length,
                    }}
                    recentPosts={posts}
                    recentMessages={messages}
                  />
                )}
                {section === "posts" && (
                  <PostsSection
                    posts={posts}
                    onChange={refresh}
                    loading={loading}
                  />
                )}
                {section === "gallery" && (
                  <GallerySection
                    items={gallery}
                    onChange={refresh}
                    loading={loading}
                  />
                )}
                {section === "ministers" && (
                  <MinistersSection
                    ministers={ministers}
                    onChange={refresh}
                    loading={loading}
                  />
                )}
                {section === "directory" && <DirectorySection />}
                {section === "messages" && (
                  <MessagesSection
                    messages={messages}
                    onChange={refresh}
                    loading={loading}
                  />
                )}
                {section === "settings" && (
                  <SettingsSection onLogout={logout} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
