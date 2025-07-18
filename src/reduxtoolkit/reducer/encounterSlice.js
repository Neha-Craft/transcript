
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';
const baseurl = "https://transcribe.pr.craftandcode.in";
export const postEncounterApi = createAsyncThunk(
  'btn/postEncounterApi',
  async (id, { rejectWithValue }) => {
    try {
      const url = `${baseurl}/api/v1/encounters/`;
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiJhOTk3OGVmZi1hOTZhLTRmZWItYmRhYS1iYzEyNWJjZmJlMTMiLCJzY29wZSI6InNlc3Npb24iLCJpbXBlcnNvbmF0aW9uIjpbXSwiY3JlYXRlZCI6MTc1MTYyMzk4NSwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6ImM4Y2FjNjM3LTgyNGUtNGZlMi1hNGQzLWZjMzM3MTMyMGNhMiIsInN0ZXBVcHMiOltdLCJhdWQiOiJhdXRoLXNlcnZpY2UiLCJuYmYiOjE3NTE2MjM5ODUsImV4cCI6MTc1NDIxNTk4NSwiaWF0IjoxNzUxNjIzOTg1LCJlbWFpbCI6InN5c19hZG1pbkBnbWFpbC5jb20iLCJ0ZW5hbnRJZCI6IjdiNWQ3NWU5LTM1OTItNDMyMi04ZTU0LWRkNDU2ZmQwZTJjNyJ9.L3p6IWZv_e-EavLXFv-uXPic1yd5t71fOGLnB847G_c"; 
      const response = await Axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error posting encounter:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const getAllEncounterApi = createAsyncThunk(
  'auth/getAllEncounterApi',
  async (_, { rejectWithValue }) => {
    try {
      const url = `${baseurl}/api/v1/encounters/all`;

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiJhOTk3OGVmZi1hOTZhLTRmZWItYmRhYS1iYzEyNWJjZmJlMTMiLCJzY29wZSI6InNlc3Npb24iLCJpbXBlcnNvbmF0aW9uIjpbXSwiY3JlYXRlZCI6MTc1MTYyMzk4NSwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6ImM4Y2FjNjM3LTgyNGUtNGZlMi1hNGQzLWZjMzM3MTMyMGNhMiIsInN0ZXBVcHMiOltdLCJhdWQiOiJhdXRoLXNlcnZpY2UiLCJuYmYiOjE3NTE2MjM5ODUsImV4cCI6MTc1NDIxNTk4NSwiaWF0IjoxNzUxNjIzOTg1LCJlbWFpbCI6InN5c19hZG1pbkBnbWFpbC5jb20iLCJ0ZW5hbnRJZCI6IjdiNWQ3NWU5LTM1OTItNDMyMi04ZTU0LWRkNDU2ZmQwZTJjNyJ9.L3p6IWZv_e-EavLXFv-uXPic1yd5t71fOGLnB847G_c";

      const response = await Axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching encounters:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchPatientDetails = createAsyncThunk(
  'auth/patchPatientDetails',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const url = `${baseurl}/api/v1/encounters/${id}/title`;

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiJhOTk3OGVmZi1hOTZhLTRmZWItYmRhYS1iYzEyNWJjZmJlMTMiLCJzY29wZSI6InNlc3Npb24iLCJpbXBlcnNvbmF0aW9uIjpbXSwiY3JlYXRlZCI6MTc1MTYyMzk4NSwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6ImM4Y2FjNjM3LTgyNGUtNGZlMi1hNGQzLWZjMzM3MTMyMGNhMiIsInN0ZXBVcHMiOltdLCJhdWQiOiJhdXRoLXNlcnZpY2UiLCJuYmYiOjE3NTE2MjM5ODUsImV4cCI6MTc1NDIxNTk4NSwiaWF0IjoxNzUxNjIzOTg1LCJlbWFpbCI6InN5c19hZG1pbkBnbWFpbC5jb20iLCJ0ZW5hbnRJZCI6IjdiNWQ3NWU5LTM1OTItNDMyMi04ZTU0LWRkNDU2ZmQwZTJjNyJ9.L3p6IWZv_e-EavLXFv-uXPic1yd5t71fOGLnB847G_c";

      const response = await Axios.patch(
        url,
        data, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error patching patient details:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const getAllInformationApi = createAsyncThunk(
  'auth/getAllInformationApi',
  async (id, { rejectWithValue }) => {
    try {
      const url = `${baseurl}/api/v1/encounters/${id}`;

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiJhOTk3OGVmZi1hOTZhLTRmZWItYmRhYS1iYzEyNWJjZmJlMTMiLCJzY29wZSI6InNlc3Npb24iLCJpbXBlcnNvbmF0aW9uIjpbXSwiY3JlYXRlZCI6MTc1MTYyMzk4NSwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6ImM4Y2FjNjM3LTgyNGUtNGZlMi1hNGQzLWZjMzM3MTMyMGNhMiIsInN0ZXBVcHMiOltdLCJhdWQiOiJhdXRoLXNlcnZpY2UiLCJuYmYiOjE3NTE2MjM5ODUsImV4cCI6MTc1NDIxNTk4NSwiaWF0IjoxNzUxNjIzOTg1LCJlbWFpbCI6InN5c19hZG1pbkBnbWFpbC5jb20iLCJ0ZW5hbnRJZCI6IjdiNWQ3NWU5LTM1OTItNDMyMi04ZTU0LWRkNDU2ZmQwZTJjNyJ9.L3p6IWZv_e-EavLXFv-uXPic1yd5t71fOGLnB847G_c";

      const response = await Axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching encounters:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteIdApi = createAsyncThunk(
  'auth/deleteAllApi',
  async (id, { rejectWithValue }) => {
    try {
      const url = `${baseurl}/api/v1/encounters/${id}`;

      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhc3NvY2lhdGlvbnMiOltdLCJzdWIiOiJhOTk3OGVmZi1hOTZhLTRmZWItYmRhYS1iYzEyNWJjZmJlMTMiLCJzY29wZSI6InNlc3Npb24iLCJpbXBlcnNvbmF0aW9uIjpbXSwiY3JlYXRlZCI6MTc1MTYyMzk4NSwidmVyaWZpZWQiOnRydWUsImlzcyI6InNlc3Npb24tc2VydmljZSIsInNlc3Npb25JZCI6ImM4Y2FjNjM3LTgyNGUtNGZlMi1hNGQzLWZjMzM3MTMyMGNhMiIsInN0ZXBVcHMiOltdLCJhdWQiOiJhdXRoLXNlcnZpY2UiLCJuYmYiOjE3NTE2MjM5ODUsImV4cCI6MTc1NDIxNTk4NSwiaWF0IjoxNzUxNjIzOTg1LCJlbWFpbCI6InN5c19hZG1pbkBnbWFpbC5jb20iLCJ0ZW5hbnRJZCI6IjdiNWQ3NWU5LTM1OTItNDMyMi04ZTU0LWRkNDU2ZmQwZTJjNyJ9.L3p6IWZv_e-EavLXFv-uXPic1yd5t71fOGLnB847G_c";

      const response = await Axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching encounters:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);






const initialState = {
  idNumber: "",
  loading: false,
  error: null,
  responseData: null,
  titleChange:null,
  title:""
};


const authSlice = createSlice({
  name: 'encounter',
  initialState,
  reducers: {
    TenantId(state, action) {
   
      state.idNumber = action.payload;
    },
      NameChange(state, action) {
        console.log("action",action)
     
      state.title = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(postEncounterApi.pending, (state) => {
        state.loading = true;
     
      })
        .addCase(getAllEncounterApi.pending, (state) => {
        state.loading = true;
    
      })
        .addCase(patchPatientDetails.pending, (state) => {
        state.loading = true;
    
      })
         .addCase(getAllInformationApi.pending, (state) => {
        state.loading = true;
    
      })
      .addCase(postEncounterApi.fulfilled, (state, action) => {
        state.loading = false;
        state.responseData = action.payload;
      })
        .addCase(getAllEncounterApi.fulfilled, (state, action) => {
        state.loading = false;
       
      })
        .addCase(getAllInformationApi.fulfilled, (state, action) => {
        state.loading = false;
       
      })
         .addCase(patchPatientDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.titleChange = action.payload;
      })
      
      .addCase(postEncounterApi.rejected, (state, action) => {
        state.loading = false;
 
      })
         .addCase(getAllEncounterApi.rejected, (state, action) => {
        state.loading = false;
      
      })
         .addCase(patchPatientDetails.rejected, (state, action) => {
        state.loading = false;
      
      })
         .addCase(getAllInformationApi.rejected, (state, action) => {
        state.loading = false;
      
      })
  }
});

export const { TenantId,NameChange } = authSlice.actions;
export default authSlice.reducer;
