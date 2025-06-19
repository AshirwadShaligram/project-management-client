"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjects, getProjectStats } from "@/redux/slice/projectSlice";
import {
  getMyAssignedIssues,
  getMyReportedIssues,
  getProjectIssues,
} from "@/redux/slice/issueSlice";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import IssueCard from "@/components/issues/issue-card";
import PriorityBadge from "@/components/ui/priority-badge";
import StatusBadge from "@/components/ui/status-badge";
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FolderKanban,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { projects = [], loading: projectsLoading } = useSelector(
    (state) => state.project || {}
  );
  const {
    assignedIssues = { issues: [], pagination: null },
    reportedIssues = { issues: [], pagination: null },
    projectIssues = {},
    loading: issuesLoading,
  } = useSelector((state) => state.issue || {});

  // Get all projects' stats from Redux state
  const { stats: allProjectsStats = {}, loading: statsLoading } = useSelector(
    (state) => state.project || {}
  );

  // Calculate combined stats from all projects
  const combinedStats = projects?.reduce(
    (acc, project) => {
      // Skip if project is null or doesn't have an _id
      if (!project?._id) return acc;

      const projectStats = allProjectsStats[project._id] || {};
      return {
        totalIssues: acc.totalIssues + (projectStats.totalIssues || 0),
        inProgressIssues:
          acc.inProgressIssues + (projectStats.inProgressIssues || 0),
        doneIssues: acc.doneIssues + (projectStats.doneIssues || 0),
        highPriorityIssues:
          acc.highPriorityIssues + (projectStats.highPriorityIssues || 0),
        memberCount: acc.memberCount + (projectStats.memberCount || 0),
      };
    },
    {
      totalIssues: 0,
      inProgressIssues: 0,
      doneIssues: 0,
      highPriorityIssues: 0,
      memberCount: 0,
    }
  ) || {
    totalIssues: 0,
    inProgressIssues: 0,
    doneIssues: 0,
    highPriorityIssues: 0,
    memberCount: 0,
  };

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getMyAssignedIssues({}));
    dispatch(getMyReportedIssues({}));
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => {
        if (!allProjectsStats[project._id]) {
          dispatch(getProjectStats(project._id));
        }
      });

      // Fetch issues for the first 3 projects only (for dashboard display)
      projects.slice(0, 3).forEach((project) => {
        if (!projectIssues[project._id]) {
          dispatch(getProjectIssues({ projectId: project._id }));
        }
      });
    }
  }, [projects, dispatch]);

  const getIssueCountForProject = (projectId) => {
    return projectIssues[projectId]?.issues?.length || 0;
  };

  const getCompletedIssuesCount = (projectId) => {
    return (
      projectIssues[projectId]?.issues?.filter(
        (issue) => issue.status === "Done"
      ).length || 0
    );
  };

  const recentIssues = reportedIssues?.issues?.slice(0, 4) || [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your projects."
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Issues
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : combinedStats.totalIssues || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Across {projects.length} projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  In Progress
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : combinedStats.inProgressIssues || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Active work items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : combinedStats.doneIssues || 0}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {combinedStats.totalIssues > 0
                    ? `${Math.round(
                        (combinedStats.doneIssues / combinedStats.totalIssues) *
                          100
                      )}% completion`
                    : "Great progress!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  High Priority
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : combinedStats.highPriorityIssues || 0}
                </div>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Issues */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    My Issues (
                    {issuesLoading ? "..." : assignedIssues.issues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {issuesLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading issues...</p>
                    </div>
                  ) : assignedIssues.issues.length > 0 ? (
                    assignedIssues.issues.map((issue) => (
                      <IssueCard key={issue._id} issue={issue} showProject />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No issues assigned to you</p>
                      <p className="text-sm">
                        Great job staying on top of things!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Projects */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarImage src={issue.reporter.avatar} />
                        <AvatarFallback className="text-xs">
                          {issue.reporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900">
                          <span className="font-medium">
                            {issue.reporter.name}
                          </span>{" "}
                          created issue{" "}
                          <span className="font-medium">{issue.key}</span>
                        </p>
                        <p className="text-gray-500 truncate">{issue.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={issue.status} />
                          <PriorityBadge priority={issue.priority} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Active Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FolderKanban className="h-5 w-5 mr-2 text-purple-500" />
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projectsLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading projects...</p>
                    </div>
                  ) : projects.length > 0 ? (
                    <>
                      {projects.slice(0, 3).map((project) => (
                        <div
                          key={project._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {project.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {project.member.length} members
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {getIssueCountForProject(project._id)} issues
                            </div>
                            <div className="text-xs text-gray-500">
                              {getCompletedIssuesCount(project._id)} completed
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => router.push("/projects")}
                      >
                        View All Projects
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No projects found</p>
                      <Button variant="outline" className="mt-3">
                        Create New Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
