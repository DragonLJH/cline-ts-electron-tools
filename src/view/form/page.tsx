import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomForm from '@/components/CustomForm/CustomForm';

const FormPage: React.FC = () => {
  const [submitResult, setSubmitResult] = useState<Record<string, any> | null>(null);

  const formConfig = {
    fields: [
      {
        name: 'name',
        type: 'text' as const,
        label: '✨ 姓名',
        placeholder: '请输入您的姓名',
        required: true,
        validation: [
          { type: 'required' as const, message: '姓名不能为空' },
          { type: 'minLength' as const, value: 2, message: '姓名至少2个字符' }
        ]
      },
      {
        name: 'email',
        type: 'email' as const,
        label: '📧 邮箱',
        placeholder: 'example@email.com',
        required: true,
        validation: [
          { type: 'required' as const, message: '邮箱不能为空' },
          { type: 'pattern' as const, value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
        ]
      },
      {
        name: 'age',
        type: 'number' as const,
        label: '🎂 年龄',
        placeholder: '18',
        validation: [
          { type: 'min' as const, value: 18, message: '年龄不能小于18岁' }
        ]
      },
      {
        name: 'gender',
        type: 'radio' as const,
        label: '👤 性别',
        options: [
          { label: '♂️ 男', value: 'male' },
          { label: '♀️ 女', value: 'female' }
        ]
      },
      {
        name: 'country',
        type: 'select' as const,
        label: '🌍 国家',
        placeholder: '请选择您的国家',
        options: [
          { label: '🏳️ 请选择国家', value: '' },
          { label: '🇨🇳 中国', value: 'china' },
          { label: '🇺🇸 美国', value: 'usa' },
          { label: '🇯🇵 日本', value: 'japan' }
        ]
      },
      {
        name: 'search',
        type: 'search' as const,
        label: '🔍 搜索功能',
        placeholder: '搜索产品、用户或内容...',
        description: '支持实时搜索和防抖处理'
      },
      {
        name: 'attachment',
        type: 'file' as const,
        label: '📎 文件上传',
        placeholder: '选择文件或拖拽上传',
        description: '支持单一或多个文件上传'
      },
      {
        name: 'message',
        type: 'textarea' as const,
        label: '💬 留言',
        placeholder: '请输入您的留言或建议...',
        validation: [
          { type: 'maxLength' as const, value: 200, message: '留言不能超过200个字符' }
        ]
      }
    ],
    layout: 'vertical' as const,
    size: 'medium' as const,
    submitText: '🚀 提交表单',
    resetText: '🔄 重置表单',
    onSubmit: (values: Record<string, any>) => {
      setSubmitResult(values);
      console.log('表单数据：', values);
      alert(`表单提交成功！收到 ${Object.keys(values).length} 个字段的数据。`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      <div className="relative">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">返回主页</span>
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">系统运行正常</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 页面标题区域 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-full mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">交互式演示</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              CustomForm 表单系统
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              体验企业级的表单组件系统，支持{' '}
              <span className="font-semibold text-blue-600">13种字段类型</span>、{' '}
              <span className="font-semibold text-purple-600">智能验证</span>、{' '}
              <span className="font-semibold text-green-600">无样式输入框</span>和{' '}
              <span className="font-semibold text-orange-600">现代化设计</span>
            </p>

            {/* 功能标签 */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                '文本输入', '邮箱验证', '密码输入', '数字输入',
                '多行文本', '下拉选择', '单选按钮', '复选框',
                '开关组件', '搜索输入', '文件上传', '日期时间'
              ].map((feature, index) => (
                <span key={feature} className={`px-3 py-1 bg-${['blue', 'purple', 'green', 'red', 'yellow', 'indigo'][index % 6]}-100 text-${['blue', 'purple', 'green', 'red', 'yellow', 'indigo'][index % 6]}-700 text-xs font-medium rounded-full transition-all duration-300 hover:scale-105`}>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* 表单区域 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-300 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">信息录入表单</h2>
                    <p className="text-blue-100 text-sm">请填写以下信息，我们将为您提供个性化服务</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CustomForm {...formConfig} />
              </div>
            </div>
          </div>

          {/* 提交结果展示区域 - 在表单下方，不挤占空间 */}
          {submitResult && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">提交成功！</h2>
                      <p className="text-green-100 text-sm">表单已成功验证并提交</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        接收到的数据
                      </h3>

                      <div className="space-y-3">
                        {Object.entries(submitResult).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-medium text-green-600 min-w-0 sm:min-w-[80px]">{key}:</span>
                            <span className="text-gray-700 bg-white px-3 py-1 rounded border text-sm break-all">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        JSON 格式
                      </h3>

                      <pre className="text-xs text-green-800 bg-green-100 rounded-lg p-4 overflow-x-auto font-mono">
                        {JSON.stringify(submitResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 底部信息 */}
          <div className="text-center py-8 border-t border-gray-200/50 bg-white/30 rounded-t-2xl backdrop-blur-sm">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>基于 React + TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Tailwind CSS 样式</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Electron 集成</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
