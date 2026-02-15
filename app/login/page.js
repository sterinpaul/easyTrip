"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LucidePlane, LucideMapPin, LucideCompass, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, otp);
      // login function handles redirect
    } catch (error) {
      console.error(error);
      alert(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.3),rgba(0,0,0,0))] z-0" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[100px] opacity-30 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center text-center"
      >
        <div className="mb-6 p-4 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
          <LucidePlane size={40} className="text-white" />
        </div>

        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          EasyTrip
        </h1>
        <p className="text-gray-400 mb-8 font-light">
          {step === 1 ? "Enter your email to continue." : "Enter the OTP sent to your email."}
        </p>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="w-full space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all transform active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={20} /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin}
              className="w-full space-y-4"
            >
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all tracking-widest text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform active:scale-95 disabled:opacity-70 shadow-lg shadow-purple-500/25"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Change Email
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-center gap-4 text-gray-500/50">
          <LucideMapPin size={20} className="animate-bounce delay-100" />
          <LucideCompass size={20} className="animate-bounce delay-300" />
        </div>
      </motion.div>
    </div>
  );
}
