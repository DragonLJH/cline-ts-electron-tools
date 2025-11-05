// 使用新版本BPMN库，具有更好的TypeScript支持
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initialDiagram } from '@/utils/bpmn/xmlStr'
import CustomModeler from '@/utils/bpmn/CustomModeler';
import { CustomPropertiesPanelRenderer, defaultCustomPropertiesConfig } from '@/utils/bpmn/CustomPropertiesPanel';
import { contextPadProviderModule } from "@/utils/bpmn/CustomContextPadProvider"
// 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

import { Button } from '@/components/Commom';
import { Link } from 'react-router-dom';

// 新建流程图XML模板（内联定义，避免文件导入问题） 

const BPMNPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<CustomModeler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('untitled.bpmn');
  const customPropertiesPanelRef = useRef<CustomPropertiesPanelRenderer | null>(null);

  // Initialize custom properties panel
  const initializeCustomPropertiesPanel = useCallback((modeler: CustomModeler, container: HTMLElement) => {
    try {
      const injector = (modeler as any).get('injector');
      const eventBus = (modeler as any).get('eventBus');

      if (!injector || !eventBus) {
        console.warn('BPMN Modeler injector or eventBus not available');
        return;
      }

      // Configure custom properties panel
      const config = {
        ...defaultCustomPropertiesConfig,
        parent: container,
        showToolbar: true,
        showElementInfo: true,
        enableKeyboardShortcuts: true,
        enableTooltips: true,
        theme: 'light' as const
      };

      const propertiesPanel = new CustomPropertiesPanelRenderer(config, injector, eventBus);
      customPropertiesPanelRef.current = propertiesPanel;

    } catch (error) {
      console.error('Failed to initialize custom properties panel:', error);
    }
  }, []);

  // 初始化 BPMN Modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new CustomModeler({
      container: containerRef.current,
      additionalModules: [
        contextPadProviderModule
      ],
      keyboard: { bindTo: document }
    });

    modelerRef.current = modeler;

    // 导入新图表
    const openDiagram = async (diagram: string) => {
      try {
        await modeler.importXML(diagram);

        // Initialize custom properties panel after modeler is loaded
        if (propertiesPanelRef.current) {
          initializeCustomPropertiesPanel(modeler, propertiesPanelRef.current);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to import diagram', err);
      }
    };

    openDiagram(initialDiagram);

    return () => {
      if (customPropertiesPanelRef.current) {
        customPropertiesPanelRef.current.destroy();
        customPropertiesPanelRef.current = null;
      }
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, [initializeCustomPropertiesPanel]);

  // 新建图表
  const handleNew = useCallback(async () => {
    if (!modelerRef.current) return;
    try {
      await modelerRef.current.importXML(initialDiagram);
      setCurrentFileName('untitled.bpmn');
    } catch (err) {
      console.error('Failed to create new diagram', err);
    }
  }, []);

  // 打开文件
  const handleOpen = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bpmn,.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !modelerRef.current) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await modelerRef.current!.importXML(e.target?.result as string);
          setCurrentFileName(file.name);
        } catch (err) {
          alert('Failed to load BPMN file: ' + err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // 保存文件
  const handleSave = useCallback(async () => {
    if (!modelerRef.current) return;

    try {
      const result = await modelerRef.current.saveXML({ format: true });
      const blob = new Blob([result.xml || ''], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to save BPMN file: ' + err);
    }
  }, [currentFileName]);

  // 导出为 PNG
  const handleExportPNG = useCallback(async () => {
    if (!modelerRef.current) return;

    try {
      const result = await modelerRef.current.saveSVG();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 使用 SVG 数据创建 PNG
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.download = currentFileName.replace('.bpmn', '.png');
        link.href = canvas.toDataURL();
        link.click();
      };

      const svgBlob = new Blob([result.svg], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    } catch (err) {
      alert('Failed to export PNG: ' + err);
    }
  }, [currentFileName]);

  // 模拟执行
  const handleSimulate = useCallback(async () => {
    if (!modelerRef.current) return;

    const simulation = modelerRef.current.get('tokenSimulation') as any;
    if (simulation?.toggle) {
      simulation.toggle();
    }
  }, []);

  // 适应画布
  const handleFit = useCallback(() => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    if (canvas?.zoom) {
      canvas.zoom('fit-viewport');
    }
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    if (canvas?.zoom) {
      canvas.zoom(canvas.zoom() * 1.2);
    }
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get('canvas') as any;
    if (canvas?.zoom) {
      canvas.zoom(canvas.zoom() * 0.8);
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* 头部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-block px-3 py-1 bg-gray-600 text-white rounded no-underline transition-all duration-200 hover:opacity-90 hover:shadow-lg"
          >
            ← 返回主页
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">🎯 BPMN 流程设计器</h1>
          <span className="text-sm text-gray-600 font-mono">{currentFileName}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 文件操作 */}
          <Button onClick={handleNew} size="small" className="bg-blue-600 hover:bg-blue-700">
            🆕 新建
          </Button>
          <Button onClick={handleOpen} size="small" variant="outlined">
            📂 打开
          </Button>
          <Button onClick={handleSave} size="small" className="bg-green-600 hover:bg-green-700">
            💾 保存
          </Button>
          <Button onClick={handleExportPNG} size="small" variant="outlined">
            🖼️ 导出PNG
          </Button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* 视图操作 */}
          <Button onClick={handleZoomIn} size="small" variant="outlined">
            ➕ 放大
          </Button>
          <Button onClick={handleZoomOut} size="small" variant="outlined">
            ➖ 缩小
          </Button>
          <Button onClick={handleFit} size="small" variant="outlined">
            🎯 适应视图
          </Button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* 模拟操作 */}
          <Button onClick={handleSimulate} size="small" className="bg-purple-600 hover:bg-purple-700">
            ▶️ 开始模拟
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* BPMN 画布区域 */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="w-full h-full bg-white"
            style={{ minHeight: '600px' }}
          >
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载 BPMN 设计器...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 属性面板 */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">🔧 属性面板</h3>
          </div>
          <div
            ref={propertiesPanelRef}
            className="flex-1 overflow-auto"
            style={{ minHeight: '400px' }}
          >
            {!isLoaded && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">选择流程元素查看属性</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>🔧 BPMN 2.0 编辑器</span>
          <span>•</span>
          <span>拖拽元素进行设计</span>
          <span>•</span>
          <span>点击元素查看属性</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>⌨️ Ctrl+Z 撤销</span>
          <span>•</span>
          <span>⌨️ Ctrl+Y 重做</span>
          <span>•</span>
          <span>⌨️ Delete 删除</span>
        </div>
      </div>
    </div>
  );
};

export default BPMNPage;
