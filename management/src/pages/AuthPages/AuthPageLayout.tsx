import React from "react";
import { Link } from "react-router";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="fixed top-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                    <HiOutlineSquares2X2 className="size-7" />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    PIPELINES<span className="text-brand-400">.</span>
                  </span>
                </div>
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                AI-powered infrastructure for modern applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
