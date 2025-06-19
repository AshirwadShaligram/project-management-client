import api from "@/axios/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to create a new issue
const createIssue = createAsyncThunk(
  "issue/createIssue",
  async ({ projectId, issueData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/issues/projects/${projectId}/issues`,
        issueData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create issue"
      );
    }
  }
);

// Async thunk to get all issues for a project
const getProjectIssues = createAsyncThunk(
  "issue/getProjectIssues",
  async ({ projectId, filters = {} }, { rejectWithValue }) => {
    try {
      const {
        status,
        priority,
        assignee,
        search,
        page = 1,
        limit = 10,
      } = filters;
      const params = { status, priority, assignee, search, page, limit };

      const response = await api.get(
        `/api/issues/projects/${projectId}/issues`,
        {
          params,
        }
      );
      return {
        projectId,
        issues: response.data.data,
        pagination: {
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project issues"
      );
    }
  }
);

// Async thunk to get a single issue
const getIssue = createAsyncThunk(
  "issue/getIssue",
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/issues/${issueId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch issue"
      );
    }
  }
);

// Async thunk to update an issue
const updateIssue = createAsyncThunk(
  "issue/updateIssue",
  async ({ issueId, issueData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/issues/${issueId}`, issueData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update issue"
      );
    }
  }
);

// Async thunk to delete an issue
const deleteIssue = createAsyncThunk(
  "issue/deleteIssue",
  async (issueId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/issues/${issueId}`);
      return issueId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete issue"
      );
    }
  }
);

// Async thunk to assign an issue
const assignIssue = createAsyncThunk(
  "issue/assignIssue",
  async ({ issueId, assigneeId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/issues/${issueId}/assign`, {
        assigneeId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign issue"
      );
    }
  }
);

// Async thunk to update issue status
const updateIssueStatus = createAsyncThunk(
  "issue/updateIssueStatus",
  async ({ issueId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/issues/${issueId}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update issue status"
      );
    }
  }
);

// Async thunk to get issues assigned to current user
const getMyAssignedIssues = createAsyncThunk(
  "issue/getMyAssignedIssues",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { status, priority, page = 1, limit = 10 } = filters;
      const params = { status, priority, page, limit };

      const response = await api.get("/api/issues/assigned-to-me", { params });
      return {
        issues: response.data.data,
        pagination: {
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assigned issues"
      );
    }
  }
);

// Async thunk to get issues reported by current user
const getMyReportedIssues = createAsyncThunk(
  "issue/getMyReportedIssues",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { status, priority, page = 1, limit = 10 } = filters;
      const params = { status, priority, page, limit };

      const response = await api.get("/api/issues/reported-by-me", { params });
      return {
        issues: response.data.data,
        pagination: {
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reported issues"
      );
    }
  }
);

const initialState = {
  currentIssue: null,
  projectIssues: {},
  assignedIssues: {
    issues: [],
    pagination: null,
  },
  reportedIssues: {
    issues: [],
    pagination: null,
  },
  loading: false,
  error: null,
  success: false,
};

const issueSlice = createSlice({
  name: "issue",
  initialState,
  reducers: {
    resetIssueState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    clearIssueError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Issue
    builder.addCase(createIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      const projectId = action.payload.projectId._id;

      // Add to project issues if the project is in state
      if (state.projectIssues[projectId]) {
        state.projectIssues[projectId].issues.unshift(action.payload);
      }
    });
    builder.addCase(createIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get Project Issues
    builder.addCase(getProjectIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProjectIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      const { projectId, issues, pagination } = action.payload;
      state.projectIssues[projectId] = { issues, pagination };
    });
    builder.addCase(getProjectIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Single Issue
    builder.addCase(getIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentIssue = action.payload;
    });
    builder.addCase(getIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Issue
    builder.addCase(updateIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.currentIssue = action.payload;

      // Update in project issues if it exists there
      const projectId = action.payload.projectId._id;
      if (state.projectIssues[projectId]) {
        const index = state.projectIssues[projectId].issues.findIndex(
          (issue) => issue._id === action.payload._id
        );
        if (index !== -1) {
          state.projectIssues[projectId].issues[index] = action.payload;
        }
      }

      // Update in assigned issues if it exists there
      const assignedIndex = state.assignedIssues.issues.findIndex(
        (issue) => issue._id === action.payload._id
      );
      if (assignedIndex !== -1) {
        state.assignedIssues.issues[assignedIndex] = action.payload;
      }

      // Update in reported issues if it exists there
      const reportedIndex = state.reportedIssues.issues.findIndex(
        (issue) => issue._id === action.payload._id
      );
      if (reportedIndex !== -1) {
        state.reportedIssues.issues[reportedIndex] = action.payload;
      }
    });
    builder.addCase(updateIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Delete Issue
    builder.addCase(deleteIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;

      // Remove from current issue if it's the one being deleted
      if (state.currentIssue?._id === action.payload) {
        state.currentIssue = null;
      }

      // Remove from project issues if it exists there
      for (const projectId in state.projectIssues) {
        state.projectIssues[projectId].issues = state.projectIssues[
          projectId
        ].issues.filter((issue) => issue._id !== action.payload);
      }

      // Remove from assigned issues if it exists there
      state.assignedIssues.issues = state.assignedIssues.issues.filter(
        (issue) => issue._id !== action.payload
      );

      // Remove from reported issues if it exists there
      state.reportedIssues.issues = state.reportedIssues.issues.filter(
        (issue) => issue._id !== action.payload
      );
    });
    builder.addCase(deleteIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Assign Issue
    builder.addCase(assignIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(assignIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.currentIssue = action.payload;

      // Update in project issues if it exists there
      const projectId = action.payload.projectId._id;
      if (state.projectIssues[projectId]) {
        const index = state.projectIssues[projectId].issues.findIndex(
          (issue) => issue._id === action.payload._id
        );
        if (index !== -1) {
          state.projectIssues[projectId].issues[index] = action.payload;
        }
      }

      // Update in assigned issues if it exists there
      const assignedIndex = state.assignedIssues.issues.findIndex(
        (issue) => issue._id === action.payload._id
      );
      if (assignedIndex !== -1) {
        state.assignedIssues.issues[assignedIndex] = action.payload;
      }
    });
    builder.addCase(assignIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Update Issue Status
    builder.addCase(updateIssueStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateIssueStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.currentIssue = action.payload;

      // Update in project issues if it exists there
      const projectId = action.payload.projectId._id;
      if (state.projectIssues[projectId]) {
        const index = state.projectIssues[projectId].issues.findIndex(
          (issue) => issue._id === action.payload._id
        );
        if (index !== -1) {
          state.projectIssues[projectId].issues[index] = action.payload;
        }
      }

      // Update in assigned issues if it exists there
      const assignedIndex = state.assignedIssues.issues.findIndex(
        (issue) => issue._id === action.payload._id
      );
      if (assignedIndex !== -1) {
        state.assignedIssues.issues[assignedIndex] = action.payload;
      }
    });
    builder.addCase(updateIssueStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get My Assigned Issues
    builder.addCase(getMyAssignedIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyAssignedIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.assignedIssues = {
        issues: action.payload.issues,
        pagination: action.payload.pagination,
      };
    });
    builder.addCase(getMyAssignedIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get My Reported Issues
    builder.addCase(getMyReportedIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyReportedIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.reportedIssues = {
        issues: action.payload.issues,
        pagination: action.payload.pagination,
      };
    });
    builder.addCase(getMyReportedIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export {
  createIssue,
  getProjectIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateIssueStatus,
  getMyAssignedIssues,
  getMyReportedIssues,
};

export const { resetIssueState, clearCurrentIssue, clearIssueError } =
  issueSlice.actions;
export default issueSlice.reducer;
