import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PriorityBadge from "@/components/ui/priority-badge";
import { Calendar, MessageCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

const IssueCard = ({ issue, showProject = false, isDragging = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Ensure issue and issue._id exist
  if (!issue || !issue._id) {
    return null; // or return a placeholder card
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? "shadow-lg scale-105" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-gray-500">
                {issue.key}
              </span>
              <PriorityBadge priority={issue.priority} />
            </div>
            {/* {isHovered && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            )} */}
          </div>

          {/* Title */}
          <Link href={`/issues/${issue._id}`} passHref>
            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
              {issue.title}
            </h3>
          </Link>

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {issue.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{issue.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {issue.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(issue.dueDate), "MMM d")}</span>
                </div>
              )}
              {issue.comments && issue.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{issue.comments.length}</span>
                </div>
              )}
            </div>

            {issue.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={issue.assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {issue.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueCard;
