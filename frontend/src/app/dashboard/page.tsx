"use client";

import React from "react";
import { 
  FolderGit2, 
  ListTodo, 
  Zap, 
  Cpu,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { name: "Active Projects", value: "24", change: "+4%", icon: FolderGit2, color: "text-blue-500" },
  { name: "Tasks in Queue", value: "142", change: "-12", icon: ListTodo, color: "text-amber-500" },
  { name: "Throughput (t/h)", value: "842.5", change: "+18%", icon: Zap, color: "text-emerald-500" },
  { name: "Orchestrator", value: "Optimal", change: "99.9%", icon: Cpu, color: "text-indigo-500" },
];

const LIVE_TASKS = [
  { id: "T-1024", task: "Artifact Handoff", status: "completed", time: "2m ago", agent: "PM -> Dev" },
  { id: "T-1025", task: "Unit Testing", status: "in_progress", time: "now", agent: "QA Agent" },
  { id: "T-1026", task: "Prompt Optimization", status: "pending", time: "scheduled", agent: "Orchestrator" },
  { id: "T-1027", task: "Code Generation", status: "completed", time: "5m ago", agent: "Dev Agent" },
  { id: "T-1028", task: "Human Review", status: "waiting", time: "pending approval", agent: "Lead Dev" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Enterprise Overview</h1>
          <p className="text-slate-500 text-sm">Real-time orchestration and agent health metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
            Deploy New Agent
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-panel p-6 rounded-2xl hover:bg-white/15 transition-all group border-white/10 hover:border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl bg-white/5", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  stat.change.startsWith('+') ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                )}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Task Stream */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border-white/10 flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Live Task Stream
            </h3>
            <button className="text-slate-500 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {LIVE_TASKS.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold",
                      task.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                      task.status === "in_progress" ? "bg-blue-500/10 text-blue-500 animate-pulse" :
                      task.status === "waiting" ? "bg-amber-500/10 text-amber-500" :
                      "bg-white/5 text-slate-500"
                    )}>
                      {task.id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{task.task}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{task.agent}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>{task.time}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                      task.status === "completed" ? "text-emerald-500 border border-emerald-500/20" :
                      task.status === "in_progress" ? "text-blue-500 border border-blue-500/20" :
                      task.status === "waiting" ? "text-amber-500 border border-amber-500/20" :
                      "text-slate-500 border border-white/5"
                    )}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-white/5 text-center">
            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">
              View All Pipeline Activity
            </button>
          </div>
        </div>

        {/* System Health (Right Column Placeholder) */}
        <div className="glass-panel rounded-2xl p-6 border-white/10 h-fit">
          <h3 className="text-lg font-bold text-white mb-6">Orchestrator Health</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400">Context Window</span>
                <span className="text-blue-500">82% Capacity</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400">API Latency</span>
                <span className="text-emerald-500">142ms</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All agent protocols active.</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                  <span className="text-slate-500">Last Snapshot:</span>
                  <span className="font-mono text-slate-300">2024-03-30 14:22:10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
