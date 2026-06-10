"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/shared";

export function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
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
    <div className="admin-theme flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-lg"
      >
        <div className="flex flex-col items-center gap-3 border-b bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-8 text-center text-white">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <LogoMark className="size-9" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold">Admin Console</h1>
            <p className="mt-0.5 text-sm text-white/80">
              Ministry of Local Government &amp; Regional Development
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          <Field label="Username" htmlFor="login-username">
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </Field>

          <Field label="Password" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
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

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Authorised personnel only.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
