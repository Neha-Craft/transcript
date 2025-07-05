import { configureStore } from '@reduxjs/toolkit';
import encounterSlice from './reducer/encounterSlice';

export const store = configureStore({
  reducer: {
    encounter: encounterSlice,
  },
});
