"use client";

/**
 * Admin sign-in — built on the shadcn studio "login-page-04" split-panel block
 * (branded left panel + clean form), re-themed in the ministry palette (ink /
 * gold / brand) and scoped to `.admin-theme`. Behaviour is unchanged:
 * data.auth.login(username, password), sonner errors, onSuccess() on success.
 * No visible credential hint.
 */
import * as React from "react";
import { motion } from "motion/react";
import { EyeIcon, EyeOffIcon, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await data.auth.login(username.trim(), password);
      toast.success("Signed in.");
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid username or password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-theme min-h-dvh bg-background lg:grid lg:grid-cols-2">
      {/* Branded panel (ink + gold emblem treatment) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-ink-foreground max-lg:hidden lg:flex xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <LogoMark className="size-8" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-sm font-extrabold tracking-tight">
              MLGRD Admin
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-foreground/60">
              Local Government · Guyana
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-heading text-3xl font-extrabold leading-tight xl:text-4xl">
            Admin Console
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-foreground/75">
            Manage news, the photo gallery, ministers &amp; officials, citizen
            messages, and portal updates for the Ministry of Local Government
            &amp; Regional Development.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-ink-foreground/60">
          <ShieldCheck className="size-4 text-gold" />
          Authorised personnel only.
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Compact crest header — also shown on mobile where the panel is hidden */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm lg:hidden">
              <LogoMark className="size-9" />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">
                Sign in
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back. Enter your credentials to continue.
              </p>
            </div>
          </div>

          <form onSubmit={submit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="login-username">Username</FieldLabel>
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  placeholder="Enter your username"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="login-password"
                    type={visible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <InputGroupAddon align="inline-end" className="pr-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVisible((v) => !v)}
                      className="text-muted-foreground hover:bg-transparent"
                    >
                      {visible ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                      <span className="sr-only">
                        {visible ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Button
                type="submit"
                disabled={busy}
                className="mt-1 w-full bg-brand-600 hover:bg-brand-700"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" /> Sign in
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground lg:justify-start">
            <ShieldCheck className="size-3.5" />
            Authorised personnel only.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
