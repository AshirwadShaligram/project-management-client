"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import PriorityBadge from "@/components/ui/priority-badge";
import StatusBadge from "@/components/ui/status-badge";
import {
  Edit,
  Calendar,
  User,
  MessageCircle,
  Send,
  Clock,
  Tag,
  Paperclip,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { getIssue } from "@/redux/slice/issueSlice";
import { getProject } from "@/redux/slice/projectSlice";
import { createComment, getIssueComments } from "@/redux/slice/commentSlice";
import {
  uploadAttachment,
  getMyAttachments,
} from "@/redux/slice/attachmentSlice";
import EditIssueDialog from "@/components/layout/EditIssueDialog";

const IssueDetail = () => {
  const params = useParams();
  const issueId = params.id;
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [newComment, setNewComment] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const {
    currentIssue,
    loading: issueLoading,
    error: issueError,
  } = useSelector((state) => state.issue);
  const {
    currentProject,
    loading: projectLoading,
    error: projectError,
  } = useSelector((state) => state.project);
  const {
    issueComments,
    loading: commentLoading,
    error: commentError,
    success: commentSuccess,
  } = useSelector((state) => state.comment);
  const {
    attachments: myAttachments,
    loading: attachmentLoading,
    error: attachmentError,
  } = useSelector((state) => state.attachment);
  const { user } = useSelector((state) => state.auth);

  // Get comments for current issue
  const currentIssueComments = issueComments[issueId] || [];

  useEffect(() => {
    if (issueId) {
      dispatch(getIssue(issueId));
      // Fetch comments for this issue
      dispatch(getIssueComments({ issueId, page: 1, limit: 50 }));
    }
  }, [dispatch, issueId]);

  useEffect(() => {
    if (currentIssue?.projectId?._id) {
      dispatch(getProject(currentIssue.projectId._id));
    }
  }, [dispatch, currentIssue]);

  useEffect(() => {
    // Fetch user's attachments when component mounts
    dispatch(getMyAttachments({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Refresh comments after successful comment creation
  useEffect(() => {
    if (commentSuccess && issueId) {
      dispatch(getIssueComments({ issueId, page: 1, limit: 50 }));
    }
  }, [commentSuccess, dispatch, issueId]);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await dispatch(
          createComment({
            issueId,
            content: newComment,
            attachments: attachments.map((att) => att._id),
          })
        ).unwrap();

        // Reset form
        setNewComment("");
        setAttachments([]);
        setAttachmentPreview(null);

        // Refresh comments
        dispatch(getIssueComments({ issueId, page: 1, limit: 50 }));
      } catch (error) {
        console.error("Failed to create comment:", error);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await dispatch(uploadAttachment(file)).unwrap();

      setAttachments((prev) => [...prev, result]);

      // Set preview for images
      if (result.type === "image") {
        setAttachmentPreview(result.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att._id !== attachmentId));
    if (
      attachmentPreview &&
      attachments.find((att) => att._id === attachmentId)?.url ===
        attachmentPreview
    ) {
      setAttachmentPreview(null);
    }
  };

  if (issueLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (issueError || projectError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Error loading issue
          </h1>
          <p className="text-gray-600">{issueError || projectError}</p>
          <Button
            onClick={() => {
              if (issueId) dispatch(getIssue(issueId));
              if (currentIssue?.projectId?._id)
                dispatch(getProject(currentIssue.projectId._id));
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentIssue || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Issue not found
          </h1>
          <p className="text-gray-600">
            The issue you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${currentIssue.key} • ${currentProject.name}`}
        subtitle={currentIssue.title}
      />

      <EditIssueDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        issue={currentIssue}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Issue Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-semibold text-gray-900">
                          {currentIssue.title}
                        </h1>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditDialogOpen(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-mono text-gray-500">
                          {currentIssue.key}
                        </span>
                        <StatusBadge status={currentIssue.status} />
                        <PriorityBadge priority={currentIssue.priority} />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {currentIssue.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {currentIssue.tags?.length > 0 && (
                    <div className="mt-6 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {currentIssue.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Comments ({currentIssueComments.length})
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Show loading state for comments */}
                  {commentLoading && currentIssueComments.length === 0 && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading comments...
                      </p>
                    </div>
                  )}

                  {/* Display error if any */}
                  {commentError && (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600">{commentError}</p>
                    </div>
                  )}

                  {/* Existing Comments - Use Redux state instead of currentIssue.comments */}
                  {currentIssueComments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar} />
                        <AvatarFallback>
                          {comment.author?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {comment.author?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(
                              new Date(comment.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-700">{comment.content}</p>
                          {/* Display comment attachments */}
                          {comment.attachment?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {comment.attachment.map((att) => (
                                <div
                                  key={att._id}
                                  className="flex items-center"
                                >
                                  {att.type === "image" ? (
                                    <img
                                      src={att.url}
                                      alt="Attachment"
                                      className="max-h-40 max-w-sm object-cover rounded border cursor-pointer"
                                      onClick={() =>
                                        window.open(att.url, "_blank")
                                      }
                                    />
                                  ) : (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center text-blue-600 hover:underline"
                                    >
                                      <Paperclip className="h-4 w-4 mr-1" />
                                      {att.originalFilename}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show message when no comments */}
                  {!commentLoading && currentIssueComments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="border-t pt-6">
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px]"
                        />

                        {/* Attachment preview */}
                        {attachmentPreview && (
                          <div className="relative inline-block">
                            <img
                              src={attachmentPreview}
                              alt="Preview"
                              className="h-40 w-40 object-cover rounded border"
                            />
                            <button
                              onClick={() => {
                                const attachment = attachments.find(
                                  (att) => att.url === attachmentPreview
                                );
                                if (attachment)
                                  removeAttachment(attachment._id);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Non-image attachments */}
                        {attachments.filter(
                          (att) => att.url !== attachmentPreview
                        ).length > 0 && (
                          <div className="space-y-2">
                            {attachments
                              .filter((att) => att.url !== attachmentPreview)
                              .map((att) => (
                                <div
                                  key={att._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                      {att.originalFilename}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeAttachment(att._id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <label className="cursor-pointer">
                            <input
                              ref={fileInputRef}
                              type="file"
                              onChange={handleFileUpload}
                              className="hidden"
                              accept="image/*,.pdf,.mp4"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={handleAttachClick}
                              disabled={isUploading}
                            >
                              <Paperclip className="h-4 w-4 mr-2" />
                              {isUploading ? "Uploading..." : "Attach"}
                            </Button>
                          </label>
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || commentLoading}
                          >
                            {commentLoading ? (
                              "Posting..."
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Comment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Issue Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assignee */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Assignee
                    </span>
                    {currentIssue.assignee ? (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentIssue.assignee?.avatar} />
                          <AvatarFallback className="text-xs">
                            {currentIssue.assignee?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {currentIssue.assignee?.name}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        Unassigned
                      </Button>
                    )}
                  </div>

                  {/* Reporter */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Reporter
                    </span>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={currentIssue.reporter?.avatar} />
                        <AvatarFallback className="text-xs">
                          {currentIssue.reporter?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {currentIssue.reporter?.name}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Due Date
                    </span>
                    {currentIssue.dueDate ? (
                      <span className="text-sm">
                        {format(new Date(currentIssue.dueDate), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        Set due date
                      </Button>
                    )}
                  </div>

                  {/* Created */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Created
                    </span>
                    <span className="text-sm">
                      {format(new Date(currentIssue.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* Updated */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Updated
                    </span>
                    <span className="text-sm">
                      {format(new Date(currentIssue.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded text-sm flex items-center justify-center font-medium text-blue-700">
                      {currentProject.key}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {currentProject.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentProject.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
