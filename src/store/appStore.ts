import { create } from 'zustand';
import { LanguageManager, SupportedLanguage } from '@/utils/locales';

// 统一的状态接口，包含所有需要同步的状态
interface UnifiedState {
  // App状态
  theme: 'light' | 'dark';
  count: number;
  // 语言状态
  language: SupportedLanguage;

  // 动作
  setTheme: (theme: 'light' | 'dark') => void;
  increment: () => void;
  setLanguage: (language: SupportedLanguage) => void;
}

interface InitialUnifiedState {
  theme: 'light' | 'dark';
  count: number;
  language: SupportedLanguage;
}

// 获取统一的初始状态
function getInitialState(): InitialUnifiedState {
  if (typeof window === 'undefined') {
    return {
      theme: 'light',
      count: 0,
      language: 'zh-CN'
    };
  }

  console.log('=== 统一初始状态调试 ===');
  console.log('当前URL:', window.location.href);

  return {
    theme: 'light',
    count: 0,
    language: 'zh-CN'
  };
}

// 统一的app store，包含app状态和语言状态
export const useAppStore = create<UnifiedState>((set, get) => ({
  ...getInitialState(),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  increment: () => set((state) => ({ count: state.count + 1 })),
  setLanguage: (language: SupportedLanguage) => {
    set({ language });
    // 立即切换本地i18n语言
    LanguageManager.changeLanguage(language);
  },
}));

// 同步标志，避免循环同步
let isReceivingRemoteUpdate = false;

// 跨窗口同步逻辑
if (typeof window !== 'undefined' && window.electronAPI) {

  // 监听远程更新
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ELECTRON_INIT_STATE') {
      console.log('[ELECTRON_INIT_STATE]', event.data.state);
      isReceivingRemoteUpdate = true;
      useAppStore.setState(event.data.state);
      LanguageManager.changeLanguage(event.data.state.language);
      isReceivingRemoteUpdate = false;
    }
    if (event.data.type === 'ELECTRON_STATE_UPDATE') {
      console.log('[ELECTRON_STATE_UPDATE]', event.data.state);
      isReceivingRemoteUpdate = true;
      useAppStore.setState(event.data.state);
      LanguageManager.changeLanguage(event.data.state.language);
      isReceivingRemoteUpdate = false;
    }
  });

  // 发送本地状态变化
  useAppStore.subscribe((state, prevState) => {
    // 只有当不是接收远程更新时才发送状态更新，避免循环同步
    if (!isReceivingRemoteUpdate) {
      console.log('[subscribe] 发送本地状态更新', state, prevState);
      const { theme, count, language } = state;
      window.electronAPI.sendStateUpdate({ theme, count, language });
    } else {
      console.log('[subscribe] 跳过远程状态更新', state, prevState);
    }
  });
}
