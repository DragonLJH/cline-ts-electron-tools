// 使用新版本BPMN库，具有更好的TypeScript支持
import React, { useEffect, useRef, useState, useCallback } from 'react';
import CustomModeler from '@/utils/bpmn/CustomModeler';
import { contextPadProviderModule } from "@/utils/bpmn/CustomContextPadProvider"
import CustomTypeSafePropertiesPanelModule from "@/utils/bpmn/CustomPropertiesPanel"
// 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

import { Button } from '@/components/Commom';
import { Link } from 'react-router-dom';

// 新建流程图XML模板（内联定义，避免文件导入问题） 

const BPMNPage: React.FC = () => {
  const modelerRef = useRef(null), propertiesRef = useRef(null)
  const [modeler, setModeler] = useState<CustomModeler | null>(null);
  useEffect(() => {
    if (modelerRef?.current && !modeler) {
      const newModeler = new CustomModeler({
        container: modelerRef.current,
        propertiesPanel: {
          parent: propertiesRef.current,
        },
        additionalModules: [
          CustomTypeSafePropertiesPanelModule,
          contextPadProviderModule
          // CustomPropertiesPanelRenderer,
          // BpmnPropertiesPanelModule,
          // BpmnPropertiesProviderModule
        ]
      });
      // newModeler.importXML(initialDiagram)
      setModeler(newModeler);
    }
  }, [modelerRef.current]);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* 头部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">

      </div>
      {/* 主内容区域 */}
      <div className="flex-1 flex min-h-0">
        {/* BPMN 画布区域 */}
        <div className="flex-1 relative">
          <div
            ref={modelerRef}
            className="w-full h-full bg-white"
            style={{ minHeight: '600px' }}
          >
          </div>
        </div>

        {/* 属性面板 */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">🔧 属性面板</h3>
          </div>
          <div
            ref={propertiesRef}
            className="flex-1 overflow-auto"
            style={{ minHeight: '400px' }}
          >
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPMNPage;
