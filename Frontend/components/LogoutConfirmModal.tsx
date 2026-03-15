"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 py-20 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl pointer-events-auto"
            >
              {/* Decorative background element */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
              <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <LogOut size={32} />
                </div>

                <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  Confirm Logout
                </h2>
                <p className="mb-8 text-white/60">
                  Are you sure you want to log out of your ProScript account? You will need to sign back in to access your dashboard.
                </p>

                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 rounded-xl bg-rose-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;
