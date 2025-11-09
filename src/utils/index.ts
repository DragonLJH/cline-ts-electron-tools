
// 随机字符
export const randomStr = (length: number): string => {
    let str = Math.random().toString(36).slice(2);
    if (str.length < length) {
        // 如果生成的随机字符串长度小于需求长度，递归调用自身来补充
        return str + randomStr(length - str.length);
    } else {
        return str.slice(0, length);
    }
};

// Modal 弹窗选项接口
interface ModalOptions {
    /** 弹窗标题 */
    title?: string;
    /** 弹窗内容 */
    message?: string;
    /** 确认按钮文本 */
    confirmText?: string;
    /** 取消按钮文本 */
    cancelText?: string;
    /** 点击背景是否关闭弹窗 */
    closeOnBackdrop?: boolean;
}

// 元素创建配置接口
interface ElementConfig {
    attributes?: Record<string, string | number | boolean>;
    tagName?: string;
    textContent?: string;
}

/**
 * 创建 DOM 元素的工具函数
 * @param attr 元素属性
 * @param tagName 标签名称
 * @param textContent 文本内容
 * @returns 创建的 DOM 元素
 */
function _createElement(
    attr: Record<string, string | number | boolean>,
    tagName = "div",
    textContent?: string
): HTMLElement {
    const el = document.createElement(tagName);
    const _attr = Object.entries(attr);
    if (_attr.length) {
        _attr.forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                el.setAttribute(key, value.toString());
            }
        });
    }
    if (textContent) el.textContent = textContent;
    return el;
}

/**
 * 显示模态对话框
 * @param options 弹窗配置选项
 * @returns Promise<boolean> 用户点击确认返回 true，取消返回 false
 */
export function showModal(options: ModalOptions = {}): Promise<boolean> {
    const {
        title = "提示",
        message = "",
        confirmText = "确定",
        cancelText = "取消",
        closeOnBackdrop = true,
    } = options;
    // 使用 TailwindCSS 类名，无需额外样式注入
    return new Promise<boolean>((resolve) => {
        // 创建元素（分别创建以避免类型推断问题）
        const backdrop = _createElement({
            class: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-45 z-50",
            "aria-hidden": "true",
            "aria-modal": "true",
        });
        const dialog = _createElement({
            class: "bg-white max-w-md w-full sm:max-w-lg rounded-lg shadow-xl overflow-hidden text-sm font-sans",
            tabIndex: -1,
        });
        const header = _createElement({ class: "px-4 py-3.5 border-b border-gray-200 font-semibold" }, "div", title);
        const body = _createElement({ class: "px-4 py-4 text-gray-700 whitespace-pre-wrap" }, "div", message);
        const footer = _createElement({ class: "flex gap-2 justify-end px-4 py-3 border-t border-gray-100" });

        const btnCancel = _createElement({
            class: "appearance-none border border-gray-300 bg-white rounded-md px-3.5 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50"
        }, "button", cancelText) as HTMLButtonElement;
        const btnOk = _createElement({
            class: "appearance-none border border-blue-600 bg-blue-600 text-white rounded-md px-3.5 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700"
        }, "button", confirmText) as HTMLButtonElement;

        // 组装 DOM
        footer.append(btnCancel, btnOk);
        dialog.append(header, body, footer);
        backdrop.append(dialog);
        document.body.appendChild(backdrop);

        // 聚焦与滚动锁
        const prevActive = document.activeElement as HTMLElement | null;
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        setTimeout(() => (dialog as HTMLDialogElement | HTMLElement).focus(), 0);

        const cleanup = (val: boolean) => {
            document.body.removeChild(backdrop);
            document.documentElement.style.overflow = prevOverflow || "";
            if (prevActive?.focus) prevActive.focus();
            resolve(val);
        };

        // 事件监听器
        btnOk.addEventListener("click", () => cleanup(true));
        btnCancel.addEventListener("click", () => cleanup(false));

        backdrop.addEventListener("click", (e: Event) => {
            if (!closeOnBackdrop) return;
            if (e.target === backdrop) cleanup(false);
        });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") cleanup(false);
            if (e.key === "Enter") cleanup(true);
        };
        document.addEventListener("keydown", onKey, { once: true });
    });
};
