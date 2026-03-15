"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, PenSquare, User, Menu, X, Video as VideoIcon } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 glass-dark">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-gradient">
            ProScript
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Explore
            </Link>
            <Link href={user ? "/videos" : "/login"} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Videos
            </Link>
            <Link href={user ? "/create-blog" : "/login"} className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              <PenSquare size={18} />
              <span>Write</span>
            </Link>
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="relative z-50 rounded-lg p-1 text-white/70 hover:text-white md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute left-0 top-full flex w-full flex-col border-b border-white/10 glass-dark p-6 md:hidden"
              >
                <div className="flex flex-col gap-6">
                  <Link
                    href="/"
                    className="text-lg font-medium text-white/70 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Explore
                  </Link>
                  <Link
                    href={user ? "/videos" : "/login"}
                    className="text-lg font-medium text-white/70 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link
                    href={user ? "/create-blog" : "/login"}
                    className="flex items-center gap-3 text-lg font-medium text-white/70 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <PenSquare size={20} />
                    <span>Write</span>
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-lg font-medium text-white/70 hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <User size={20} />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsLogoutModalOpen(true);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 text-lg font-medium text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Link
                        href="/login"
                        className="text-lg font-medium text-white/70 hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="rounded-xl bg-white px-6 py-3 text-center text-lg font-bold text-black"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;
