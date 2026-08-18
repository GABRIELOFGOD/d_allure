"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-void">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-line bg-surface p-8">
        <div className="text-center mb-8">
          <div className="font-display text-2xl tracking-widest-plus text-beige">D_ALLURE</div>
          <p className="font-mono text-[10px] uppercase tracking-widest-plus text-beige-dim mt-2">Admin Console</p>
        </div>

        <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim mb-5"
        />

        <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim mb-7"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-burgundy hover:bg-burgundy-bright text-white py-3 font-mono text-xs tracking-widest-plus uppercase transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
}
