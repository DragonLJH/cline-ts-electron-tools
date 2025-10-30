import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    electronAPI: {
      openChildWindow: (initialRoute?: string) => Promise<{ success: boolean; message: string; windowId?: number }>;
      closeChildWindow: () => Promise<{ success: boolean; message: string }>;
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      restoreWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      getPlatform: () => string;
    };
  }
}

const CustomTitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string>('unknown');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      setPlatform(window.electronAPI.getPlatform());
      updateMaximizedState();
    }
  }, []);

  const updateMaximizedState = async () => {
    if (window.electronAPI) {
      const maximized = await window.electronAPI.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximizeWindow();
      setIsMaximized(true);
    }
  };

  const handleRestore = async () => {
    if (window.electronAPI) {
      await window.electronAPI.restoreWindow();
      setIsMaximized(false);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.closeWindow();
    }
  };

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // 只有Windows且不是子窗口才显示自定义标题栏
  const urlParams = new URLSearchParams(window.location.search);
  const isChildWindow = !!urlParams.get('initialRoute');
  if (platform !== 'win32' || isChildWindow) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full h-10 bg-gray-200 border-b border-gray-300 select-none relative" onClick={() => setActiveDropdown(null)}>
      {/* 左边：标题 */}
      <div className="font-semibold text-gray-800 ml-2">Electron App</div>

      {/* 右边：菜单和控制按钮 */}
      <div className="flex items-center">
        {/* 菜单按钮 */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); toggleDropdown('file'); }}
            className="px-2 py-1 hover:bg-gray-300 rounded text-sm"
          >
            文件
          </button>
          {activeDropdown === 'file' && (
            <div className="absolute top-full right-0 bg-white border border-gray-300 shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  if (window.electronAPI) window.electronAPI.openChildWindow('/');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                新建窗口
              </button>
              <button
                onClick={() => {
                  handleClose();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                退出
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); toggleDropdown('edit'); }}
            className="px-2 py-1 hover:bg-gray-300 rounded text-sm"
          >
            编辑
          </button>
          {activeDropdown === 'edit' && (
            <div className="absolute top-full right-0 bg-white border border-gray-300 shadow-lg z-10 min-w-[120px]">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">复制</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">粘贴</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); toggleDropdown('view'); }}
            className="px-2 py-1 hover:bg-gray-300 rounded text-sm"
          >
            视图
          </button>
          {activeDropdown === 'view' && (
            <div className="absolute top-full right-0 bg-white border border-gray-300 shadow-lg z-10 min-w-[120px]">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">切换全屏</button>
            </div>
          )}
        </div>

        {/* 窗口控制按钮 */}
        <button
          onClick={() => { handleMinimize(); setActiveDropdown(null); }}
          className="w-12 h-10 hover:bg-gray-300 flex items-center justify-center group cursor-pointer"
          title="最小化"
        >
          <span className="w-3 h-0.5 bg-gray-600"></span>
        </button>

        <button
          onClick={() => {
            if (isMaximized) {
              handleRestore();
            } else {
              handleMaximize();
            }
            setActiveDropdown(null);
          }}
          className="w-12 h-10 hover:bg-gray-300 flex items-center justify-center group cursor-pointer"
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h4V4h2v4H4v11h12V8h4v2h1V4H3zM8 8h9v9H8z"
              />
            </svg>
          ) : (
            <span className="w-4 h-4 border border-gray-600 flex items-center justify-center">
              <span className="w-2 h-2 border border-gray-600 block"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => { handleClose(); setActiveDropdown(null); }}
          className="w-12 h-10 hover:bg-red-500 hover:text-white flex items-center justify-center group cursor-pointer"
          title="关闭"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar;
