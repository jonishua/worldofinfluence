"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        if (error) throw error;
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An authentication error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--gray-bg)]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <div>
                  <h2 className="text-[var(--text-primary)] font-bold text-lg leading-tight">
                    {isLogin ? "Secure Access" : "Create Account"}
                  </h2>
                  <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider">
                    Vault Protocol v1.0
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--gray-surface)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="p-6 space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="vault_operator"
                      className="w-full bg-[var(--gray-surface)] border border-[var(--card-border)] rounded-[12px] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@influence.world"
                    className="w-full bg-[var(--gray-surface)] border border-[var(--card-border)] rounded-[12px] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--gray-surface)] border border-[var(--card-border)] rounded-[12px] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-[12px] font-mono"
                >
                  ERROR: {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00C805] hover:bg-[#00E005] disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-[12px] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,200,5,0.3)]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {isLogin ? "INITIALIZE SESSION" : "REGISTER OPERATOR"}
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="p-6 bg-[var(--gray-surface)]/50 border-t border-[var(--card-border)] text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono uppercase tracking-tighter transition-colors"
              >
                {isLogin
                  ? "Need access? Register new operator"
                  : "Already registered? Initialize session"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
