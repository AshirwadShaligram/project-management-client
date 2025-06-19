"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Header from "@/components/layout/Header";
import KanbanBoard from "@/components/kanban/kanban-board";
import IssueFilters from "@/components/issues/issue-filters";
import IssueCard from "@/components/issues/issue-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/redux/slice/projectSlice";
import { getProjectIssues } from "@/redux/slice/issueSlice";
import { Plus, Users, BarChart3, List, Kanban } from "lucide-react";
import CreateIssue from "@/components/layout/CreateIssue";

const ProjectDetail = () => {
  const params = useParams();
  const projectId = params.id;
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("board");
  const [filters, setFilters] = useState({});
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  const {
    currentProject,
    loading: projectLoading,
    error: projectError,
  } = useSelector((state) => state.project);
  const {
    projectIssues,
    loading: issuesLoading,
    error: issuesError,
  } = useSelector((state) => state.issue);

  // Get current project issues
  const currentProjectIssues = projectIssues[projectId]?.issues || [];
  const filteredIssues = applyFilters(currentProjectIssues, filters);

  useEffect(() => {
    if (projectId) {
      dispatch(getProject(projectId));
      dispatch(getProjectIssues({ projectId }));
    }
  }, [dispatch, projectId]);

  function applyFilters(issues, filters) {
    let filtered = [...issues];

    if (filters.search) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          issue.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((issue) => issue.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(
        (issue) => issue.priority === filters.priority
      );
    }

    if (filters.assignee) {
      filtered = filtered.filter(
        (issue) => issue.assignee?._id === filters.assignee
      );
    }

    return filtered;
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateIssue = () => {
    setCreateIssueOpen(true);
  };

  // Loading state
  if (projectLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || issuesError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Error loading project
          </h1>
          <p className="text-gray-600">{projectError || issuesError}</p>
          <Button
            onClick={() => {
              dispatch(getProject(projectId));
              dispatch(getProjectIssues({ projectId }));
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Project not found
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Project not found
          </h1>
          <p className="text-gray-600">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    total: currentProjectIssues.length,
    todo: currentProjectIssues.filter((i) => i.status === "todo").length,
    inProgress: currentProjectIssues.filter((i) => i.status === "inprogress")
      .length,
    done: currentProjectIssues.filter((i) => i.status === "done").length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={currentProject.name}
        subtitle={currentProject.description}
      />

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full space-y-6">
          {/* Project Info & Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {currentProject.key ||
                  currentProject.name.substring(0, 3).toUpperCase()}
              </Badge>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {stats.total} issues
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {currentProject.member
                    ? currentProject.member.length
                    : 0}{" "}
                  members
                </div>
              </div>

              <div className="flex -space-x-2">
                {currentProject.member &&
                  currentProject.member.slice(0, 5).map((member) => (
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
                {currentProject.member && currentProject.member.length > 5 && (
                  <div className="h-8 w-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{currentProject.member.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateIssue}>
                <Plus className="h-4 w-4 mr-2" />
                Create Issue
              </Button>
            </div>
          </div>

          {/* Filters */}
          <IssueFilters onFiltersChange={handleFiltersChange} />

          {/* Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="board" className="flex items-center">
                <Kanban className="h-4 w-4 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6">
              <TabsContent value="board" className="h-full m-0">
                <KanbanBoard issues={filteredIssues} />
              </TabsContent>

              <TabsContent value="list" className="h-full m-0">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue) => (
                          <IssueCard key={issue._id} issue={issue} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <List className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No issues found</p>
                          <p className="text-sm">
                            Try adjusting your filters or create a new issue.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="h-full m-0">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Timeline view coming soon</p>
                      <p className="text-sm">
                        Track project milestones and deadlines.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <CreateIssue
        project={currentProject}
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
      />
    </div>
  );
};

export default ProjectDetail;
