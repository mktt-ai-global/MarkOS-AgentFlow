import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../src/app/dashboard/page';

// Mock Lucide icons for testing
vi.mock('lucide-react', () => ({
  FolderGit2: () => <div data-testid="icon-folder" />,
  ListTodo: () => <div data-testid="icon-todo" />,
  Zap: () => <div data-testid="icon-zap" />,
  Cpu: () => <div data-testid="icon-cpu" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  Clock: () => <div data-testid="icon-clock" />,
  ArrowUpRight: () => <div data-testid="icon-arrow" />,
  MoreVertical: () => <div data-testid="icon-more" />,
  Activity: () => <div data-testid="icon-activity" />,
}));

describe('Dashboard Page Rendering', () => {
  it('should render the dashboard title', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Enterprise Overview/i)).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasks in Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Throughput/i)).toBeInTheDocument();
    expect(screen.getByText(/Orchestrator/i)).toBeInTheDocument();
  });

  it('should render the live task stream title', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Live Task Stream/i)).toBeInTheDocument();
  });
});
