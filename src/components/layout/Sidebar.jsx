"use client";

import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjects } from "@/redux/slice/projectSlice";
import { logout } from "@/redux/slice/authSlice";
import CreateProject from "./CreateProject";

const {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  ChevronLeft,
  Search,
  Plus,
  Target,
  LogOut,
} = require("lucide-react");

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const { projects, loading, error } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProjectFlow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  !collapsed && "mr-3",
                  collapsed && "h-8 w-8"
                )}
              />
              {!collapsed && item.name}
            </Link>
          );
        })}

        {/* Create Project Button */}
        <Button
          className={cn("w-full mt-4", collapsed && "px-2")}
          size={collapsed ? "sm" : "default"}
          onClick={() => setCreateProjectOpen(true)}
        >
          <Plus className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "New Project"}
        </Button>
      </nav>

      {/* Projects List */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent Projects
          </h3>
          <div className="space-y-1">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center mr-3 font-medium">
                  {project.key}
                </div>
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "space-x-3"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateProject
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
};

export default Sidebar;
