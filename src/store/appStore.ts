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
let isSyncing = false;

// 新窗口直接通过主进程推送状态，不需要自主初始化

// 使用一个effect来确保i18n状态总是跟随store状态
useAppStore.subscribe((state) => {
  // 每当store状态改变时，强制同步到i18n
  const currentI18nLang = LanguageManager.getCurrentLanguage();
  if (currentI18nLang !== state.language) {
    console.log(`🔧 i18n跟随store: ${currentI18nLang} → ${state.language}`);
    LanguageManager.changeLanguage(state.language);
  }
});

// 跨窗口同步逻辑
if (typeof window !== 'undefined' && window.electronAPI) {
  // 只在主窗口初始化时同步状态到全局
  if (!window.location.href.includes('?')) {
    setTimeout(() => {
      const currentState = useAppStore.getState();
      window.electronAPI.sendStateUpdate({
        theme: currentState.theme,
        count: currentState.count
      });
      (window.electronAPI as any).sendLanguageUpdate({
        language: currentState.language
      });
    }, 50);
  }

  // 监听远程更新
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ELECTRON_STATE_UPDATE') {
      const { state } = event.data;
      console.log('📨 接收到远程状态更新:', state);
      isSyncing = true;
      useAppStore.setState(state, true);
      setTimeout(() => { isSyncing = false; }, 0);
    } else if (event.data.type === 'ELECTRON_LANGUAGE_UPDATE') {
      const { language } = event.data;
      console.log('🌐 接收到远程语言更新:', language);
      isSyncing = true;
      useAppStore.setState({ language });
      setTimeout(() => { isSyncing = false; }, 0);
    } else if (event.data.type === 'ELECTRON_FORCE_SET_STATE') {
      const fullState = event.data;
      console.log('🔧 强制设置状态:', JSON.stringify(fullState));
      isSyncing = true; // 防止subscribe触发
      useAppStore.setState(fullState);
      setTimeout(() => { isSyncing = false; }, 0);
    }
  });

  // 发送本地状态变化
  useAppStore.subscribe((state) => {
    if (!isSyncing) {
      const appState = { theme: state.theme, count: state.count };
      window.electronAPI.sendStateUpdate(appState);
      (window.electronAPI as any).sendLanguageUpdate({ language: state.language });
    }
  });
}

// 向后兼容 - 保留独立的language store，委托给统一store
export const useLanguageStore = () => {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return {
    language,
    setLanguage,
  };
};
