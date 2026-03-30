export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'offline';
  capabilities: string[];
  lastActive: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Artifact {
  id: string;
  taskId: string;
  type: 'code' | 'text' | 'image' | 'json';
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  activeAgents: number;
  completedTasks: number;
  failedTasks: number;
}
