import api from "@/axios/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to create a new comment
const createComment = createAsyncThunk(
  "comment/createComment",
  async ({ issueId, content, attachments }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/comments/issues/${issueId}/comments`,
        {
          content,
          attachments,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create comment"
      );
    }
  }
);

// Async thunk to get comments for an issue
const getIssueComments = createAsyncThunk(
  "comment/getIssueComments",
  async ({ issueId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/comments/issues/${issueId}/comments`,
        {
          params: { page, limit },
        }
      );
      return { issueId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

// Async thunk to get a single comment
const getComment = createAsyncThunk(
  "comment/getComment",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/comments/${commentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comment"
      );
    }
  }
);

// Async thunk to update a comment
const updateComment = createAsyncThunk(
  "comment/updateComment",
  async ({ commentId, content, attachments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, {
        content,
        attachments,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  }
);

// Async thunk to delete a comment
const deleteComment = createAsyncThunk(
  "comment/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

// Async thunk to get user's comments
const getMyComments = createAsyncThunk(
  "comment/getMyComments",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/comments/my-comments", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user comments"
      );
    }
  }
);

const initialState = {
  comments: [],
  issueComments: {},
  currentComment: null,
  myComments: [],
  currentPage: 1,
  totalPages: 1,
  totalComments: 0,
  loading: false,
  error: null,
  success: false,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    resetCommentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCommentError: (state) => {
      state.error = null;
    },
    clearCurrentComment: (state) => {
      state.currentComment = null;
    },
  },
  extraReducers: (builder) => {
    // Create Comment
    builder.addCase(createComment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      const issueId = action.payload.issueId;
      if (!state.issueComments[issueId]) {
        state.issueComments[issueId] = [];
      }
      state.issueComments[issueId].unshift(action.payload);
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get Issue Comments
    builder.addCase(getIssueComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getIssueComments.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      const { issueId, data, currentPage, totalPages, total } = action.payload;
      state.issueComments[issueId] = data;
      state.currentPage = currentPage;
      state.totalPages = totalPages;
      state.totalComments = total;
    });
    builder.addCase(getIssueComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Single Comment
    builder.addCase(getComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getComment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentComment = action.payload;
    });
    builder.addCase(getComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Comment
    builder.addCase(updateComment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateComment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.currentComment = action.payload;

      // Update in issue comments if it exists there
      const issueId = action.payload.issueId;
      if (state.issueComments[issueId]) {
        const index = state.issueComments[issueId].findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.issueComments[issueId][index] = action.payload;
        }
      }

      // Update in myComments if it exists there
      const myCommentIndex = state.myComments.findIndex(
        (c) => c._id === action.payload._id
      );
      if (myCommentIndex !== -1) {
        state.myComments[myCommentIndex] = action.payload;
      }
    });
    builder.addCase(updateComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Delete Comment
    builder.addCase(deleteComment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      const commentId = action.payload;

      // Remove from issue comments
      for (const issueId in state.issueComments) {
        state.issueComments[issueId] = state.issueComments[issueId].filter(
          (c) => c._id !== commentId
        );
      }

      // Remove from myComments
      state.myComments = state.myComments.filter((c) => c._id !== commentId);

      // Clear current comment if it's the deleted one
      if (state.currentComment?._id === commentId) {
        state.currentComment = null;
      }
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get My Comments
    builder.addCase(getMyComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyComments.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.myComments = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.totalComments = action.payload.total;
    });
    builder.addCase(getMyComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export {
  createComment,
  getIssueComments,
  getComment,
  updateComment,
  deleteComment,
  getMyComments,
};

export const { resetCommentState, clearCommentError, clearCurrentComment } =
  commentSlice.actions;
export default commentSlice.reducer;
