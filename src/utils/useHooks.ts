import { useRef, useEffect } from 'react';

// useUnmount Hook 类型定义
/**
 * 在组件卸载时执行回调函数的 Hook
 * @param fn 卸载时执行的回调函数
 */
export const useUnmount = (fn: () => void | Promise<void>): void => {
    const fnRef = useRef<() => void | Promise<void>>(fn);

    // 更新 fnRef 为最新的函数（捕获最新 deps）
    fnRef.current = fn;

    useEffect(() => {
        return () => {
            fnRef.current(); // ✅ 卸载时执行最新的 fn
        };
    }, []);
};
