import api from "@/axios/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk to upload a new attachment
const uploadAttachment = createAsyncThunk(
  "attachment/uploadAttachment",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/attachments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload attachment"
      );
    }
  }
);

// Async thunk to delete an attachment
const deleteAttachment = createAsyncThunk(
  "attachment/deleteAttachment",
  async (attachmentId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/attachments/${attachmentId}`);
      return attachmentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete attachment"
      );
    }
  }
);

// Async thunk to get user's attachments
const getMyAttachments = createAsyncThunk(
  "attachment/getMyAttachments",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/attachments/my-attachments", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attachments"
      );
    }
  }
);

const initialState = {
  attachments: [],
  currentPage: 1,
  totalPages: 1,
  totalAttachments: 0,
  loading: false,
  error: null,
  success: false,
};

const attachmentSlice = createSlice({
  name: "attachment",
  initialState,
  reducers: {
    resetAttachmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearAttachmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Upload Attachment
    builder.addCase(uploadAttachment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(uploadAttachment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.attachments.unshift(action.payload);
      state.totalAttachments += 1;
      state.totalPages = Math.ceil(state.totalAttachments / 20); // Assuming default limit of 20
    });
    builder.addCase(uploadAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Delete Attachment
    builder.addCase(deleteAttachment.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteAttachment.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.success = true;
      state.attachments = state.attachments.filter(
        (attachment) => attachment._id !== action.payload
      );
      state.totalAttachments -= 1;
      state.totalPages = Math.ceil(state.totalAttachments / 20);
    });
    builder.addCase(deleteAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    });

    // Get My Attachments
    builder.addCase(getMyAttachments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMyAttachments.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.attachments = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.totalAttachments = action.payload.total;
    });
    builder.addCase(getMyAttachments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export { uploadAttachment, deleteAttachment, getMyAttachments };

export const { resetAttachmentState, clearAttachmentError } =
  attachmentSlice.actions;
export default attachmentSlice.reducer;
