
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
    // 只注入一次样式
    if (!document.getElementById("mini-modal-style")) {
        const style = document.createElement("style");
        style.id = "mini-modal-style";
        style.textContent = `
      .mm-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.45);z-index:9999}
      .mm-dialog{background:#fff;max-width:420px;width:clamp(260px,90vw,420px);border-radius:12px;
        box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto}
      .mm-header{padding:14px 16px;border-bottom:1px solid #eee;font-weight:600}
      .mm-body{padding:16px;color:#333;white-space:pre-wrap}
      .mm-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #f2f2f2}
      .mm-btn{appearance:none;border:1px solid #dcdcdc;background:#fff;border-radius:8px;padding:8px 14px;cursor:pointer}
      .mm-btn:focus{outline:2px solid #8ab4f8;outline-offset:2px}
      .mm-btn-primary{background:#1677ff;color:#fff;border-color:#1677ff}
    `;
        document.head.appendChild(style);
    }
    return new Promise<boolean>((resolve) => {
        // 创建元素（分别创建以避免类型推断问题）
        const backdrop = _createElement({
            class: "mm-backdrop",
            "aria-hidden": "true",
            "aria-modal": "true",
        });
        const dialog = _createElement({
            class: "mm-dialog",
            tabIndex: -1,
        });
        const header = _createElement({ class: "mm-header" }, "div", title);
        const body = _createElement({ class: "mm-body" }, "div", message);
        const footer = _createElement({ class: "mm-footer" });

        const btnCancel = _createElement({ class: "mm-btn" }, "button", cancelText) as HTMLButtonElement;
        const btnOk = _createElement({ class: "mm-btn mm-btn-primary" }, "button", confirmText) as HTMLButtonElement;

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