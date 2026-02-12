"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      await new Promise((r) => setTimeout(r, 150));
      if (!mounted) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(Boolean(session));
      setReady(true);
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gray-bg)] p-4">
        <div className="flex flex-col items-center gap-4 text-[var(--gray-text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-mono">Verifying secure link…</p>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gray-bg)] p-4">
        <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] shadow-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-[var(--text-primary)] font-bold text-lg mb-2">Invalid or expired link</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            This reset link may have expired or already been used. Request a new one from the login screen.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#00C805] hover:bg-[#00E005] text-slate-900 font-bold py-3 rounded-[12px] transition-colors"
          >
            Return to game
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gray-bg)] p-4">
        <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] shadow-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-[#00C805]/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#00C805]" />
          </div>
          <h1 className="text-[var(--text-primary)] font-bold text-lg mb-2">Access key updated</h1>
          <p className="text-[var(--text-muted)] text-sm">Redirecting you to the game…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gray-bg)] p-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--card-border)] flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-[var(--accent-color)]" />
          </div>
          <div>
            <h1 className="text-[var(--text-primary)] font-bold text-lg">Set new access key</h1>
            <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider">Vault Protocol v1.0</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] ml-1">New access key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--gray-surface)] border border-[var(--card-border)] rounded-[12px] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Confirm access key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--gray-surface)] border border-[var(--card-border)] rounded-[12px] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-[12px] font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00C805] hover:bg-[#00E005] disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,200,5,0.3)]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "UPDATE ACCESS KEY"}
          </button>

          <Link
            href="/"
            className="block text-center text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono uppercase tracking-tighter transition-colors"
          >
            Cancel and return to game
          </Link>
        </form>
      </div>
    </div>
  );
}
