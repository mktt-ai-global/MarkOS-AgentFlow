import { Navigate, createBrowserRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import MessagesPage from "../pages/MessagesPage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import TasksPage from "../pages/TasksPage";
import TeamPage from "../pages/TeamPage";
import WorkspacePage from "../pages/WorkspacePage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <WorkspacePage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "tasks",
        element: <TasksPage />
      },
      {
        path: "team",
        element: <TeamPage />
      },
      {
        path: "messages",
        element: <MessagesPage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      }
    ]
  }
]);
