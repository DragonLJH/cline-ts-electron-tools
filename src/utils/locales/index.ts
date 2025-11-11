import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// 默认语言设置
export const DEFAULT_LANGUAGE = 'zh-CN';
export const FALLBACK_LANGUAGE = 'en-US';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '中文(简体)' },
  { code: 'en-US', name: 'English' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

/**
 * 获取浏览器语言代码，并转换为支持的语言代码
 */
const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language || 'zh-CN';

  // 直接匹配支持的语言
  if (browserLang in SUPPORTED_LANGUAGES.map(l => l.code)) {
    return browserLang as SupportedLanguage;
  }

  // 检查语言族，如 zh -> zh-CN, en -> en-US
  const langFamily = browserLang.split('-')[0];
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.code.startsWith(langFamily)) {
      return lang.code;
    }
  }

  // 默认返回中文
  return DEFAULT_LANGUAGE;
};

/**
 * i18next 配置初始化
 */
const initI18n = () => {
  i18n
    // 使用HTTP后端插件 (加载翻译文件)
    .use(HttpBackend)
    // 使用浏览器语言检测插件
    .use(LanguageDetector)
    // 使用React i18n插件
    .use(initReactI18next)
    // 初始化配置
    .init({
      // 调试模式 (生产环境关闭)
      debug: process.env.NODE_ENV === 'development',

      // 后备语言
      fallbackLng: FALLBACK_LANGUAGE,

      // 默认语言
      lng: getBrowserLanguage(),

      // 支持的语言
      supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),

      // 语言检测配置
      detection: {
        // 检测顺序
        order: ['localStorage', 'navigator', 'htmlTag'],

        // localStorage key
        lookupLocalStorage: 'i18nextLng',

        // 缓存设置为7天
        caches: ['localStorage'],
      },

      // 插值配置
      interpolation: {
        // 不在html中使用插值
        escapeValue: false,
      },

      // 异步加载翻译资源 (通过webpack动态import)
      backend: {
        loadPath: 'locales/{{lng}}.json',
        parse: (data: string) => JSON.parse(data),
      },

      // React 配置
      react: {
        // 使用Suspense包装异步翻译
        useSuspense: true,
        // 标签
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
      },
    });

  return i18n;
};

// 初始化并导出i18n实例
const i18nInstance = initI18n();

export default i18nInstance;

/**
 * 语言切换工具类
 */
export class LanguageManager {
  /**
   * 获取当前语言
   */
  static getCurrentLanguage(): SupportedLanguage {
    return i18nInstance.language as SupportedLanguage;
  }

  /**
   * 获取所有支持的语言
   */
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * 切换语言
   * @param language - 目标语言代码
   */
  static async changeLanguage(language: SupportedLanguage): Promise<void> {
    try {
      await i18nInstance.changeLanguage(language);
      // 可选：在这里执行语言切换后的逻辑，如保存到状态管理
      console.log(`Language changed to: ${language}`);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  }

  /**
   * 重置为默认语言
   */
  static async resetToDefault(): Promise<void> {
    await this.changeLanguage(DEFAULT_LANGUAGE);
  }

  /**
   * 检查语言是否支持
   * @param language - 语言代码
   */
  static isLanguageSupported(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === language);
  }

  /**
   * 获取翻译文本
   * @param key - 翻译键
   * @param options - 插值选项
   */
  static t(key: string, options?: any): string {
    const result = i18nInstance.t(key, options);
    return typeof result === 'string' ? result : key;
  }

  /**
   * 获取带默认值的翻译文本
   * @param key - 翻译键
   * @param defaultValue - 默认值
   * @param options - 插值选项
   */
  static tWithDefault(key: string, defaultValue: string, options?: any): string {
    const translated = this.t(key, options);
    return translated === key ? defaultValue : translated;
  }
}

/**
 * BPMN相关的翻译工具
 */
export const BpmnTranslations = {
  /**
   * 获取BPMN字段翻译
   * @param fieldName - 字段名
   * @param property - 属性名 (label, placeholder等)
   */
  getFieldTranslation(fieldName: string, property: string = 'label'): string {
    return LanguageManager.t(`bpmn.panels.properties.fields.${fieldName}.${property}`, {
      defaultValue: fieldName,
    });
  },

  /**
   * 获取BPMN面板消息翻译
   * @param messageKey - 消息键
   */
  getPanelMessage(messageKey: string): string {
    return LanguageManager.t(`bpmn.panels.properties.messages.${messageKey}`, {
      defaultValue: messageKey,
    });
  },

  /**
   * 获取BPMN元素类型翻译
   * @param elementType - 元素类型
   * @param property - 属性名 (name, description等)
   */
  getElementTranslation(elementType: string, property: string = 'name'): string {
    return LanguageManager.t(`bpmn.elements.types.${elementType}.${property}`, {
      defaultValue: elementType,
    });
  },

  /**
   * 获取工具调色板翻译
   * @param toolKey - 工具键
   */
  getPaletteTranslation(toolKey: string): string {
    return LanguageManager.t(`bpmn.tools.palettes.${toolKey}`, {
      defaultValue: toolKey,
    });
  },

  /**
   * 获取下拉选项翻译
   * @param fieldName - 字段名
   * @param optionValue - 选项值
   * @param fallbackValue - 后备值
   */
  getOptionTranslation(fieldName: string, optionValue: string, fallbackValue?: string): string {
    const translated = LanguageManager.t(
      `bpmn.panels.properties.fields.${fieldName}.options.${optionValue}`,
      { defaultValue: fallbackValue || optionValue }
    );
    return translated;
  },

  /**
   * 获取对话框翻译
   * @param dialogName - 对话框名
   * @param property - 属性名 (title, message等)
   */
  getDialogTranslation(dialogName: string, property: string): string {
    return LanguageManager.t(`dialogs.${dialogName}.${property}`, {
      defaultValue: dialogName,
    });
  },

  /**
   * 获取验证消息翻译
   * @param validationKey - 验证键
   */
  getValidationMessage(validationKey: string): string {
    return LanguageManager.t(`validations.${validationKey}`, {
      defaultValue: validationKey,
    });
  },
};

/**
 * Hook: 使用翻译
 */
export { useTranslation } from 'react-i18next';

/**
 * React组件: 翻译文本
 */
export { Trans } from 'react-i18next';

/**
 * 类型导出 - 从i18next导出
 */
export type { i18n } from 'i18next';
