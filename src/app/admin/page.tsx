"use client";

import * as React from "react";

import { data } from "@/lib/data/client";
import { LoginCard } from "@/components/admin/login-card";
import { Dashboard } from "@/components/admin/dashboard";

type AuthState = "authed" | "anon";

export default function AdminPage() {
  const [state, setState] = React.useState<AuthState>(() =>
    data.auth.isAuthenticated() ? "authed" : "anon",
  );

  if (state === "anon") {
    return <LoginCard onSuccess={() => setState("authed")} />;
  }

  return <Dashboard onLogout={() => setState("anon")} />;
}
