"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../lib/api";
import { motion } from "framer-motion";

// Separate client-only component for bubbles
const BubblesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#41CADA]/10"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client state

  useEffect(() => {
    setIsClient(true); // Set to true after component mounts
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 120 
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.03,
      backgroundColor: "#36aab8",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#191c27] to-[#0d0f17] p-4">
      {/* Only render bubbles on client */}
      {isClient && <BubblesBackground />}

      <motion.div 
        className="max-w-md w-full bg-[#1f2430] backdrop-blur-sm rounded-2xl shadow-xl border border-[#2a3041] p-8 space-y-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center">
          <motion.div
            className="mx-auto bg-gradient-to-br from-[#41CADA] to-[#2a8e9d] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#41CADA] to-[#5de8fa]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className="mt-2 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sign in to continue to your account
          </motion.p>
        </div>

        <motion.form 
          onSubmit={handleLogin} 
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {error && (
            <motion.div 
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 flex items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#41CADA]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#41CADA]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                className="w-full bg-[#2a3041] border border-[#363d52] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#41CADA] text-white placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-[#41CADA] to-[#2a8e9d] text-[#191c27] font-medium py-3 rounded-xl shadow-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#191c27]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Login"
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="text-center pt-4 border-t border-[#2a3041]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="text-[#41CADA] hover:text-[#5de8fa] font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
          
          {/* <Link 
            href="/forgot-password" 
            className="mt-3 inline-block text-sm text-gray-500 hover:text-[#41CADA] transition-colors"
          >
            Forgot password?
          </Link> */}
        </motion.div>
      </motion.div>
    </main>
  );
}