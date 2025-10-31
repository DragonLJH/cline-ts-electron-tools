import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  count: number;
  setTheme: (theme: 'light' | 'dark') => void;
  increment: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'light',
  count: 0,
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 跨窗口同步逻辑
if (typeof window !== 'undefined' && window.electronAPI) {
  // 订阅状态变化，发送到主进程
  useAppStore.subscribe((state) => {
    window.electronAPI.sendStateUpdate(JSON.parse(JSON.stringify(state)));
  });

  // 监听来自主进程的状态更新
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ELECTRON_STATE_UPDATE') {
      const { state } = event.data;
      useAppStore.setState(state, true); // replace: true 防止循环
    }
  });
}
