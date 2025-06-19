"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IssueCard from "@/components/issues/issue-card";
import { Plus, MoreHorizontal } from "lucide-react";
import { updateIssueStatus } from "@/redux/slice/issueSlice";

const KanbanBoard = ({ issues }) => {
  const [draggedIssue, setDraggedIssue] = useState(null);
  const dispatch = useDispatch();

  const columns = [
    {
      id: "todo",
      title: "To Do",
      status: "todo",
      issues: issues.filter((issue) => issue.status === "todo"),
    },
    {
      id: "inprogress",
      title: "In Progress",
      status: "inprogress",
      issues: issues.filter((issue) => issue.status === "inprogress"),
    },
    {
      id: "done",
      title: "Done",
      status: "done",
      issues: issues.filter((issue) => issue.status === "done"),
    },
  ];

  const handleDragStart = (issue) => {
    setDraggedIssue(issue);
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (draggedIssue && draggedIssue.status !== targetStatus) {
      dispatch(
        updateIssueStatus({
          issueId: draggedIssue._id,
          status: targetStatus,
        })
      );
    }
    setDraggedIssue(null);
  };

  return (
    <div className="flex space-x-6 h-full overflow-x-auto pb-6">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {column.title}
                  </CardTitle>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {column.issues.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent
              className="space-y-3 h-full overflow-y-auto"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {column.issues.map((issue) => (
                <div
                  key={issue._id}
                  draggable
                  onDragStart={() => handleDragStart(issue)}
                  onDragEnd={handleDragEnd}
                >
                  <IssueCard
                    issue={issue}
                    isDragging={draggedIssue?._id === issue._id}
                  />
                </div>
              ))}

              {column.issues.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No issues</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
