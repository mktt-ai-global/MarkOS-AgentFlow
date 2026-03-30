'use client';

import React from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Save,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 font-sora text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-white/60">Configure your MarkOS-AgentFlow enterprise environment.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sidebar Nav */}
        <div className="space-y-2 lg:col-span-1">
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-medium backdrop-blur-md">
              <Globe size={18} className="text-blue-400" />
              General Configuration
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5">
              <Database size={18} className="text-purple-400" />
              Database & Redis
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5">
              <Cpu size={18} className="text-green-400" />
              Agent Orchestration
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5">
              <ShieldCheck size={18} className="text-orange-400" />
              Security & API Keys
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Project Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              General Information
            </h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-white/40 uppercase">Project Name</label>
                <input 
                  type="text" 
                  defaultValue="MarkOS-AgentFlow" 
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm focus:border-white/30 focus:outline-none"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-white/40 uppercase">App Environment</label>
                <select className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm focus:border-white/30 focus:outline-none">
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: DB Config */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl opacity-60">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Database size={20} className="text-purple-400" />
              Database (Read-Only via UI)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className="text-green-500" />
                  <span className="text-sm font-mono text-white/80">postgresql://db:5432/agentflow</span>
                </div>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-[10px] font-bold text-green-500">CONNECTED</span>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-white/20 uppercase tracking-widest">
            Changes to system variables may require a service restart via <code className="text-white/40">install.sh</code>
          </p>
        </div>
      </div>
    </div>
  );
}
