"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { getProjectIssues } from "@/redux/slice/issueSlice";

const IssueFilters = ({ onFiltersChange, projectId }) => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const { projectIssues, loading } = useSelector((state) => state.issue);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    tags: [],
  });

  // Get current project's issues and extract unique assignees
  const currentProjectIssues = projectIssues[projectId]?.issues || [];

  // Extract unique assignees from current project issues
  const projectAssignees = currentProjectIssues.reduce((acc, issue) => {
    if (
      issue.assignee &&
      !acc.find((assignee) => assignee._id === issue.assignee._id)
    ) {
      acc.push(issue.assignee);
    }
    return acc;
  }, []);

  // Also include the current user if not already in the list
  if (user && !projectAssignees.find((assignee) => assignee._id === user._id)) {
    projectAssignees.push(user);
  }

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);

    // Dispatch action to fetch filtered issues
    if (projectId) {
      dispatch(
        getProjectIssues({
          projectId,
          filters: {
            ...updated,
            page: 1, // Reset to first page when filters change
            limit: 10,
          },
        })
      );
    }
  };

  const clearFilters = () => {
    const cleared = {
      search: "",
      status: "",
      priority: "",
      assignee: "",
      tags: [],
    };
    setFilters(cleared);
    onFiltersChange(cleared);

    // Fetch all issues without filters
    if (projectId) {
      dispatch(
        getProjectIssues({
          projectId,
          filters: { page: 1, limit: 10 },
        })
      );
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.assignee ||
    filters.tags.length > 0;

  // Helper function to get display name for status
  const getStatusDisplayName = (status) => {
    const statusMap = {
      todo: "To Do",
      inprogress: "In Progress",
      done: "Done",
    };
    return statusMap[status] || status;
  };

  // Helper function to get display name for priority
  const getPriorityDisplayName = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Primary Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search issues..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
            disabled={loading}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => updateFilters({ status: value })}
          disabled={loading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => updateFilters({ priority: value })}
          disabled={loading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.assignee}
          onValueChange={(value) => updateFilters({ assignee: value })}
          disabled={loading}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {projectAssignees.map((assignee) => (
              <SelectItem key={assignee._id} value={assignee._id}>
                {assignee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>

          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: {filters.search}
              <button
                onClick={() => updateFilters({ search: "" })}
                className="ml-1 hover:text-gray-800"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {getStatusDisplayName(filters.status)}
              <button
                onClick={() => updateFilters({ status: "" })}
                className="ml-1 hover:text-gray-800"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.priority && (
            <Badge variant="secondary" className="text-xs">
              Priority: {getPriorityDisplayName(filters.priority)}
              <button
                onClick={() => updateFilters({ priority: "" })}
                className="ml-1 hover:text-gray-800"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.assignee && (
            <Badge variant="secondary" className="text-xs">
              Assignee:{" "}
              {projectAssignees.find((u) => u._id === filters.assignee)?.name}
              <button
                onClick={() => updateFilters({ assignee: "" })}
                className="ml-1 hover:text-gray-800"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueFilters;
