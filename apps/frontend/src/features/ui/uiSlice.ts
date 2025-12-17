import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isSidebarCollapsed: boolean;
  isSearchPanelOpen: boolean;
  isNotificationPanelOpen: boolean;
  isCreatePostModalOpen: boolean;
  activePostId: string | null;
}

const initialState: UiState = {
  isSidebarCollapsed: false,
  isSearchPanelOpen: false,
  isNotificationPanelOpen: false,
  isCreatePostModalOpen: false,
  activePostId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    toggleSearchPanel: (state) => {
      state.isSearchPanelOpen = !state.isSearchPanelOpen;
      if (state.isSearchPanelOpen) {
        state.isNotificationPanelOpen = false;
      }
    },
    setSearchPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchPanelOpen = action.payload;
      if (action.payload) {
        state.isNotificationPanelOpen = false;
      }
    },
    toggleNotificationPanel: (state) => {
      state.isNotificationPanelOpen = !state.isNotificationPanelOpen;
      if (state.isNotificationPanelOpen) {
        state.isSearchPanelOpen = false;
      }
    },
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationPanelOpen = action.payload;
      if (action.payload) {
        state.isSearchPanelOpen = false;
      }
    },
    openCreatePostModal: (state) => {
      state.isCreatePostModalOpen = true;
    },
    closeCreatePostModal: (state) => {
      state.isCreatePostModalOpen = false;
    },
    setActivePost: (state, action: PayloadAction<string | null>) => {
      state.activePostId = action.payload;
    },
    closePanels: (state) => {
      state.isSearchPanelOpen = false;
      state.isNotificationPanelOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleSearchPanel,
  setSearchPanelOpen,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  openCreatePostModal,
  closeCreatePostModal,
  setActivePost,
  closePanels,
} = uiSlice.actions;

export default uiSlice.reducer;

