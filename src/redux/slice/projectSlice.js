import api from "@/axios/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to create a new project
const createProject = createAsyncThunk(
  "project/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/projects", projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project"
      );
    }
  }
);

// Async thunk to get all projects for the current user
const getProjects = createAsyncThunk(
  "project/getProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/projects");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

// Async thunk to get a single project
const getProject = createAsyncThunk(
  "project/getProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project"
      );
    }
  }
);

// Async thunk to update a project
const updateProject = createAsyncThunk(
  "project/updateProject",
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/projects/${projectId}`, projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update project"
      );
    }
  }
);

// Async thunk to delete a project
const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${projectId}`);
      return projectId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete project"
      );
    }
  }
);

// Async thunk to invite a member to a project
const inviteMember = createAsyncThunk(
  "project/inviteMember",
  async ({ projectId, email, role }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/projects/${projectId}/invite`, {
        email,
        role,
      });
      return { projectId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to invite member"
      );
    }
  }
);

// Async thunk to accept project invitation
const acceptInvitation = createAsyncThunk(
  "project/acceptInvitation",
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/projects/accept-invite/${token}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept invitation"
      );
    }
  }
);

// Async thunk to remove a member from a project
const removeMember = createAsyncThunk(
  "project/removeMember",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${projectId}/members/${memberId}`);
      return { projectId, memberId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove member"
      );
    }
  }
);

// Async thunk to get project statistics
const getProjectStats = createAsyncThunk(
  "project/getProjectStats",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/stats`);
      return { projectId, stats: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project stats"
      );
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  stats: {},
  loading: false,
  error: null,
  success: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    resetProjectState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Project
    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.projects.unshift(action.payload);
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get Projects
    builder.addCase(getProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.projects = action.payload;
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Single Project
    builder.addCase(getProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentProject = action.payload;
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Project
    builder.addCase(updateProject.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateProject.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.currentProject = action.payload;
      // Update in projects array if it exists there
      const index = state.projects.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    });
    builder.addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Delete Project
    builder.addCase(deleteProject.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.projects = state.projects.filter(
        (project) => project._id !== action.payload
      );
      if (state.currentProject?._id === action.payload) {
        state.currentProject = null;
      }
    });
    builder.addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Invite Member
    builder.addCase(inviteMember.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(inviteMember.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.success = true;
    });
    builder.addCase(inviteMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Accept Invitation
    builder.addCase(acceptInvitation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(acceptInvitation.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      // Add the project to the projects list if not already there
      const exists = state.projects.some((p) => p._id === action.payload._id);
      if (!exists) {
        state.projects.unshift(action.payload);
      }
    });
    builder.addCase(acceptInvitation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Remove Member
    builder.addCase(removeMember.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(removeMember.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      // Update current project if it's the one being modified
      if (
        state.currentProject &&
        state.currentProject._id === action.payload.projectId
      ) {
        state.currentProject.member = state.currentProject.member.filter(
          (member) => member._id !== action.payload.memberId
        );
      }
      // Update in projects array if it exists there
      const projectIndex = state.projects.findIndex(
        (p) => p._id === action.payload.projectId
      );
      if (projectIndex !== -1) {
        state.projects[projectIndex].member = state.projects[
          projectIndex
        ].member.filter((member) => member._id !== action.payload.memberId);
      }
    });
    builder.addCase(removeMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get Project Stats
    builder.addCase(getProjectStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProjectStats.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.stats = {
        ...state.stats,
        [action.payload.projectId]: action.payload.stats,
      };
    });
    builder.addCase(getProjectStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  acceptInvitation,
  removeMember,
  getProjectStats,
};

export const { resetProjectState, clearCurrentProject, clearProjectError } =
  projectSlice.actions;
export default projectSlice.reducer;
