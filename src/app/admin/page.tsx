"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { data } from "@/lib/data/client";
import { LoginCard } from "@/components/admin/login-card";
import { Dashboard } from "@/components/admin/dashboard";

type AuthState = "checking" | "authed" | "anon";

export default function AdminPage() {
  const [state, setState] = React.useState<AuthState>("checking");

  // Auth is resolved on the client only (static export + localStorage token).
  React.useEffect(() => {
    setState(data.auth.isAuthenticated() ? "authed" : "anon");
  }, []);

  if (state === "checking") {
    return (
      <div className="admin-theme flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (state === "anon") {
    return <LoginCard onSuccess={() => setState("authed")} />;
  }

  return <Dashboard onLogout={() => setState("anon")} />;
}
