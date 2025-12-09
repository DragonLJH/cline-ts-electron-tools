/**
 * 自定义BPMN XML解析器演示
 * 用于验证解析器功能是否正常工作
 */

import { importXML, CustomBpmnXmlParser } from './xmlImporter';
import { newDiagram } from '../core/xmlStr';

/**
 * 演示解析器功能
 */
function demoParser() {
  console.log('=== 自定义BPMN XML解析器演示 ===\n');

  try {
    // 创建解析器实例
    const parser = new CustomBpmnXmlParser();

    // 解析示例XML
    console.log('正在解析BPMN XML...');
    const result = parser.parse(newDiagram);

    console.log('✅ 解析成功！\n');

    // 显示解析结果
    console.log('📋 解析结果概览:');
    console.log(`   定义ID: ${result.definitions.id}`);
    console.log(`   目标命名空间: ${result.definitions.targetNamespace}`);
    console.log(`   流程数量: ${result.definitions.processes.length}`);
    console.log(`   警告数量: ${result.warnings.length}\n`);

    // 显示流程详情
    if (result.definitions.processes.length > 0) {
      const process = result.definitions.processes[0];
      console.log('🔄 流程详情:');
      console.log(`   流程ID: ${process.id}`);
      console.log(`   流程类型: ${process.type}`);
      console.log(`   可执行: ${process.isExecutable}`);
      console.log(`   元素数量: ${process.elements.length}\n`);

      // 显示各类型元素数量
      const elementTypes = process.elements.reduce((acc, el) => {
        acc[el.type] = (acc[el.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 元素类型统计:');
      Object.entries(elementTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}个`);
      });
      console.log();

      // 显示具体元素
      console.log('📝 具体元素:');
      process.elements.forEach((element, index) => {
        console.log(`   ${index + 1}. ${element.type} (ID: ${element.id})`);
        if (element.name) {
          console.log(`      名称: ${element.name}`);
        }

        // 显示连接信息
        if ('incoming' in element && element.incoming.length > 0) {
          console.log(`      入流: ${element.incoming.join(', ')}`);
        }
        if ('outgoing' in element && element.outgoing.length > 0) {
          console.log(`      出流: ${element.outgoing.join(', ')}`);
        }

        // 显示顺序流信息
        if ('sourceRef' in element && 'targetRef' in element) {
          console.log(`      源: ${element.sourceRef} → 目标: ${element.targetRef}`);
        }
        console.log();
      });
    }

    // 测试便捷函数
    console.log('🔧 测试便捷函数 importXML...');
    const result2 = importXML(newDiagram);
    console.log(`   ✅ 便捷函数工作正常，解析到 ${result2.definitions.processes.length} 个流程\n`);

    console.log('🎉 演示完成！自定义XML解析器工作正常。');

  } catch (error) {
    console.error('❌ 解析失败:', error);
    console.error('错误详情:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * 测试错误处理
 */
function demoErrorHandling() {
  console.log('\n=== 错误处理演示 ===\n');

  const parser = new CustomBpmnXmlParser();

  // 测试无效XML
  try {
    console.log('测试无效XML...');
    parser.parse('');
    console.log('❌ 应该抛出错误但没有');
  } catch (error) {
    console.log('✅ 正确捕获到无效XML错误:', error instanceof Error ? error.message : String(error));
  }

  // 测试非BPMN XML
  try {
    console.log('测试非BPMN XML...');
    parser.parse('<?xml version="1.0"?><root></root>');
    console.log('❌ 应该抛出错误但没有');
  } catch (error) {
    console.log('✅ 正确捕获到非BPMN XML错误:', error instanceof Error ? error.message : String(error));
  }
}

// 运行演示
if (typeof window === 'undefined') {
  // Node.js环境
  demoParser();
  demoErrorHandling();
} else {
  // 浏览器环境 - 可以通过console调用
  (window as any).demoBpmnParser = demoParser;
  (window as any).demoBpmnParserErrors = demoErrorHandling;
  console.log('📖 BPMN解析器演示函数已加载:');
  console.log('   运行 demoBpmnParser() 查看解析演示');
  console.log('   运行 demoBpmnParserErrors() 查看错误处理演示');
}
