import React, { useState, useEffect, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
import MenuBar from '../components/MenuBar/MenuBar';

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
      sendStateUpdate: (state: any) => void;
    };
  }
}

const CustomTitleBar = forwardRef<HTMLDivElement>(({ }, ref) => {
  const location = useLocation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    if (window.electronAPI) {
      setPlatform(window.electronAPI.getPlatform());
      updateMaximizedState();
    }

  }, []);

  // 菜单配置
  const menus = [
    {
      label: '文件',
      items: [
        {
          label: '新建窗口',
          onClick: () => {
            if (window.electronAPI) window.electronAPI.openChildWindow('/');
          }
        },
        {
          label: '退出',
          onClick: () => handleClose()
        }
      ]
    },
    {
      label: '编辑',
      items: [
        {
          label: '复制',
          onClick: () => {
            // TODO: 实现复制功能
          }
        },
        {
          label: '粘贴',
          onClick: () => {
            // TODO: 实现粘贴功能
          }
        }
      ]
    },
    {
      label: '视图',
      items: [
        {
          label: '切换全屏',
          onClick: () => {
            // TODO: 实现切换全屏功能
          }
        }
      ]
    }
  ];

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

  return (
    <div className="app-title-bar w-full" ref={ref}>
      <div className="flex items-center justify-between w-full h-10 bg-gray-200 border-b border-gray-300 select-none relative">
        <div className="font-semibold text-gray-800 ml-2">Electron App</div>
        <div className="flex items-center">
          <MenuBar menus={menus} />
          {platform === 'win32' && (
            <>
              <button
                onClick={() => handleMinimize()}
                className="w-12 h-10 hover:bg-gray-300 flex items-center justify-center group cursor-pointer [-webkit-app-region:no-drag]"
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
                }}
                className="w-12 h-10 hover:bg-gray-300 flex items-center justify-center group cursor-pointer [-webkit-app-region:no-drag]"
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
                onClick={() => handleClose()}
                className="w-12 h-10 hover:bg-red-500 hover:text-white flex items-center justify-center group cursor-pointer [-webkit-app-region:no-drag]"
                title="关闭"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center w-full h-6 bg-gray-100 border-b border-gray-300 px-3 select-none">
        <span className="text-sm text-gray-600 font-mono">
          {location.pathname}
        </span>
      </div>
    </div>
  );
});

export default CustomTitleBar;
