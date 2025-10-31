import React, { useState, useRef, useEffect } from 'react';

export interface MenuItem {
  label: string;
  items: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
}

export interface MenuBarProps {
  menus: MenuItem[];
  className?: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ menus, className = '' }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (menuLabel: string) => {
    setActiveDropdown(activeDropdown === menuLabel ? null : menuLabel);
  };

  return (
    <div className={`flex items-center ${className}`} ref={menuBarRef}>
      {menus.map((menu, index) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => toggleDropdown(menu.label)}
            className="px-2 py-1 hover:bg-gray-300 rounded text-sm [-webkit-app-region:no-drag]"
          >
            {menu.label}
          </button>
          {activeDropdown === menu.label && (
            <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-10 min-w-[120px] [-webkit-app-region:no-drag]">
              {menu.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setActiveDropdown(null);
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm [-webkit-app-region:no-drag] ${
                    item.disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
