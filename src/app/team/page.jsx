"use client";

import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Mail,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Users,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getProjects } from "@/redux/slice/projectSlice";
import { getProjectIssues } from "@/redux/slice/issueSlice";
import { inviteMember } from "@/redux/slice/projectSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Team() {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.project);
  const { projectIssues } = useSelector((state) => state.issue);
  const { user } = useSelector((state) => state.auth);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getProjects());
    projects?.forEach((project) => {
      dispatch(getProjectIssues({ projectId: project._id }));
    });
  }, [dispatch, projects]);

  const getTeamMembers = () => {
    if (!projects || projects.length === 0) return [];

    const allMembers = projects.flatMap((project) => project.member || []);
    const uniqueMembers = [];
    const memberIds = new Set();

    allMembers.forEach((member) => {
      if (!memberIds.has(member._id)) {
        memberIds.add(member._id);
        uniqueMembers.push(member);
      }
    });
    return uniqueMembers;
  };

  const getAllIssues = () => {
    if (!projectIssues || Object.keys(projectIssues).length === 0) return [];
    return Object.values(projectIssues).flatMap(
      (project) => project.issues || []
    );
  };

  const getUserStats = (userId) => {
    const allIssues = getAllIssues();
    const userIssues = allIssues.filter(
      (issue) => issue.assignee?._id === userId
    );

    return {
      total: userIssues.length,
      completed: userIssues.filter((issue) => issue.status === "done").length,
      inProgress: userIssues.filter((issue) => issue.status === "inprogress")
        .length,
    };
  };

  const getTeamStats = () => {
    const allIssues = getAllIssues();
    return {
      activeIssues: allIssues.filter((issue) => issue.status === "inprogress")
        .length,
      completedIssues: allIssues.filter((issue) => issue.status === "done")
        .length,
      totalMembers: getTeamMembers().length,
    };
  };

  const teamStats = getTeamStats();
  const teamMembers = getTeamMembers();

  const roleColors = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    member: "bg-blue-100 text-blue-800 border-blue-200",
    viewer: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const handleInviteMember = async () => {
    if (!selectedProject || !email) {
      toast.error("Please select a project and enter an email address", {
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        inviteMember({
          projectId: selectedProject,
          email,
          role,
        })
      ).unwrap();

      toast.success("Invitation sent successfully");
      setIsInviteModalOpen(false);
      setEmail("");
      setRole("developer");
      setSelectedProject("");
    } catch (error) {
      toast.error("Failed to send invitation", {
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Team"
        subtitle="Manage team members and their roles across projects."
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                {teamMembers.length} team members
              </div>
            </div>
          </div>

          {/* Invite Member Modal */}
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your project team
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember} disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {teamStats.totalMembers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Active team members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Issues
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {teamStats.activeIssues}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Currently in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Issues
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {teamStats.completedIssues}
                </div>
                <p className="text-xs text-green-600 mt-1">Great progress!</p>
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              const stats = getUserStats(member._id);
              const completionRate =
                stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <Card
                  key={member._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Role Badge */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          roleColors[member.role] || roleColors.viewer
                        }`}
                      >
                        {member.role?.charAt(0).toUpperCase() +
                          member.role?.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Work Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Workload</span>
                        <span className="font-medium">
                          {stats.total} issues
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Completion Rate</span>
                          <span>{Math.round(completionRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {stats.inProgress}
                          </div>
                          <div className="text-xs text-gray-600">
                            In Progress
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {stats.completed}
                          </div>
                          <div className="text-xs text-gray-600">Completed</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Last seen: {member.lastSeen || "Recently"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
