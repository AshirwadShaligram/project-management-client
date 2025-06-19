"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/redux/slice/projectSlice";
import { getProjectStats } from "@/redux/slice/projectSlice";
import CreateProject from "@/components/layout/CreateProject";
import {
  Plus,
  Users,
  Calendar,
  BarChart3,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.project);
  const [view, setView] = useState("grid");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  const handleGetProjectStats = (projectId) => {
    dispatch(getProjectStats(projectId));
  };

  // Calculate project stats from issues
  const getProjectStatsLocal = (project) => {
    return {
      total: project.issueCount || 0,
      completed: project.completedIssues || 0,
      inProgress: project.inProgressIssues || 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Error loading projects
          </h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => dispatch(getProjects())} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Projects"
        subtitle="Manage and track all your team projects in one place."
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>

              <div className="flex items-center space-x-2 bg-white border rounded-lg p-1">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const stats = getProjectStatsLocal(project);
                const progress =
                  stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

                return (
                  <Card
                    key={project._id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            <Link
                              href={`/projects/${project._id}`}
                              className="hover:text-blue-600"
                            >
                              {project.name}
                            </Link>
                          </CardTitle>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {project.key ||
                              project.name.substring(0, 3).toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            {stats.total} issues
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {project.member ? project.member.length : 0}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(project.updatedAt), "MMM d")}
                        </div>
                      </div>

                      {/* Team Avatars */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Team:</span>
                        <div className="flex -space-x-2">
                          {project.member &&
                            project.member.slice(0, 4).map((member) => (
                              <Avatar
                                key={member._id}
                                className="h-6 w-6 border-2 border-white"
                              >
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.name
                                    ? member.name.charAt(0)
                                    : member.email.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          {project.member && project.member.length > 4 && (
                            <div className="h-6 w-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                +{project.member.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Projects List View */
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => {
                    const stats = getProjectStatsLocal(project);
                    const progress =
                      stats.total > 0
                        ? (stats.completed / stats.total) * 100
                        : 0;

                    return (
                      <div
                        key={project._id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="text-lg font-medium">
                                  <Link
                                    href={`/projects/${project._id}`}
                                    className="hover:text-blue-600"
                                  >
                                    {project.name}
                                  </Link>
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {project.description}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {project.key ||
                                  project.name.substring(0, 3).toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                {stats.total} issues
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {project.member
                                  ? project.member.length
                                  : 0}{" "}
                                members
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Updated{" "}
                                {format(
                                  new Date(project.updatedAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                              <div>{Math.round(progress)}% complete</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex -space-x-2">
                              {project.member &&
                                project.member.slice(0, 3).map((member) => (
                                  <Avatar
                                    key={member._id}
                                    className="h-8 w-8 border-2 border-white"
                                  >
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {member.name
                                        ? member.name.charAt(0)
                                        : member.email.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                            </div>

                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress bar for list view */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <BarChart3 className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first project.
              </p>
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
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

export default Projects;
