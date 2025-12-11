// 使用新版本BPMN库，具有更好的TypeScript支持
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CustomModeler,
  contextPadProviderModule,
  CustomPropertiesPanelModule,
  paletteProviderModule
} from '@/utils/bpmn';
import {
  BpmnThemeProvider,
  BpmnThemeSwitcher,
  BpmnThemeDebugPanel,
  useBpmnTheme
} from '@/components/BpmnThemeProvider';
// 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

import { Button } from '@/components/Commom';
import { Link } from 'react-router-dom';

/**
 * BPMN画布内容组件
 */
const BPMNCanvas: React.FC = () => {
  const modelerRef = useRef<HTMLDivElement>(null);
  const propertiesRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<CustomModeler | null>(null);
  const { theme } = useBpmnTheme();

  useEffect(() => {
    if (modelerRef?.current && !modeler) {
      const newModeler = new CustomModeler({
        container: modelerRef.current as HTMLElement,
        propertiesPanel: {
          parent: propertiesRef.current as HTMLElement,
        },
        theme: theme.name.toLowerCase(),
        additionalModules: [
          CustomPropertiesPanelModule,
          contextPadProviderModule,
          paletteProviderModule
        ]
      });
      setModeler(newModeler);
    }
  }, [modelerRef.current, theme.name]);

  return (
    <>
      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* BPMN 画布区域 */}
        <div className="flex-1 relative">
          <div
            ref={modelerRef}
            className="w-full h-full bg-white dark:bg-gray-900"
            style={{ minHeight: '600px' }}
          >
          </div>
        </div>

        {/* 属性面板 */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">🔧 属性面板</h3>
          </div>
          <div
            ref={propertiesRef}
            className="flex-1 overflow-auto"
            style={{ minHeight: '400px' }}
          >
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * BPMN页面主组件
 */
const BPMNPage: React.FC = () => {
  return (
    <BpmnThemeProvider initialTheme="light" enableSystemTheme={true}>
      <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* 头部工具栏 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              BPMN 流程设计器
            </h1>
            <BpmnThemeSwitcher />
          </div>
          <div className="flex items-center space-x-2">
          </div>
        </div>

        {/* BPMN画布内容 */}
        <BPMNCanvas />

        {/* 开发调试面板 */}
        <BpmnThemeDebugPanel />
      </div>
    </BpmnThemeProvider>
  );
};

export default BPMNPage;
