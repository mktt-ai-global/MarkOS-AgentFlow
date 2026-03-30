"use client";

import React from "react";
import { Search, Bell, Activity, Cloud, ShieldCheck } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export default function TopNav() {
  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects, artifacts, or agents..."
            className="w-full h-10 bg-white/5 border border-white/5 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 border-r border-white/5 pr-6 mr-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Orchestrator: <span className="text-emerald-500">Live</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Workers: <span className="text-slate-200">12/12</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Audit: <span className="text-slate-200">Active</span></span>
          </div>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
