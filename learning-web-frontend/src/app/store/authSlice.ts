import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { name: string; email: string; role: string; mobile?: string } | null;
  token: string | null;
  identifier: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  identifier: ''
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIdentifier(state, { payload }: PayloadAction<string>) {
      state.identifier = payload;
    },
    loginSuccess(state, { payload }: PayloadAction<{ user: any; token: string }>) {
      state.user = payload.user;
      state.token = payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.identifier = '';
    }
  }
});

export const { setIdentifier, loginSuccess, logout } = slice.actions;
export default slice.reducer;
