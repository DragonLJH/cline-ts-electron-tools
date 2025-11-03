import React, { useState, useMemo } from 'react';
import { Form } from '@/components/Form';

const FormPage: React.FC = () => {
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 使用 useMemo 稳定化 initialValues，避免每次渲染都创建新对象
  const initialValues = useMemo(() => ({
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    gender: 'male',
    interests: ['programming', 'design'],
    education: 'bachelor',
    birthday: '1999-01-01',
    skills: 7,
    agree: true,
    bio: '我是一名热爱编程的开发工程师'
  }), []); // 空依赖数组，确保只创建一次

  // 配置化表单演示
  const handleConfigFormSubmit = (values: any) => {
    console.log('配置化表单数据:', values);
    setSubmitResult(values);
    setIsSubmitted(true);

    // 8秒后自动清除成功状态
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmitResult(null);
    }, 8000);
  };

  const configFormFields = [
    {
      name: 'name',
      label: '姓名',
      type: 'input' as const,
      required: true,
      placeholder: '请输入您的姓名',
      validation: {
        minLength: { value: 2, message: '姓名至少2个字符' },
        maxLength: { value: 20, message: '姓名最多20个字符' }
      }
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'email' as const,
      required: true,
      placeholder: '请输入邮箱地址'
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number' as const,
      required: true,
      min: 18,
      max: 120
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio' as const,
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' }
      ]
    },
    {
      name: 'interests',
      label: '兴趣爱好',
      type: 'checkbox' as const,
      multiple: true,
      options: [
        { label: '编程', value: 'programming' },
        { label: '设计', value: 'design' },
        { label: '音乐', value: 'music' },
        { label: '体育', value: 'sports' }
      ],
      max: 3,
      helperText: '可多选，最多3个'
    },
    {
      name: 'education',
      label: '学历',
      type: 'select' as const,
      required: true,
      placeholder: '请选择学历',
      options: [
        { label: '高中及以下', value: 'high_school' },
        { label: '大专', value: 'associate' },
        { label: '本科', value: 'bachelor' },
        { label: '硕士', value: 'master' },
        { label: '博士', value: 'doctor' }
      ]
    },
    {
      name: 'birthday',
      label: '出生日期',
      type: 'date' as const
    },
    {
      name: 'skills',
      label: '技能等级',
      type: 'range' as const,
      min: 1,
      max: 10,
      defaultValue: 5,
      step: 1,
      helperText: '滑动选择你的技能等级 (1-10)'
    },
    {
      name: 'agree',
      label: '同意协议',
      type: 'checkbox' as const,
      required: true,
      helperText: '必须同意协议才能提交'
    },
    {
      name: 'bio',
      label: '个人简介',
      type: 'textarea' as const,
      rows: 4,
      placeholder: '请简要介绍一下自己',
      validation: {
        maxLength: { value: 500, message: '个人简介最多500个字符' }
      },
      helperText: '最多500个字符 (可选)'
    }
  ];

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">📝 配置化表单展示</h1>

      <div className="space-y-8">
        {/* 测试 initialValues 值的回填 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 测试 initialValues 值回填功能</h2>
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <p className="text-sm text-yellow-800">
              这个表单使用 initialValues 预填了一些数据，验证配置化表单是否能正确显示和修改初始值
            </p>
          </div>

          <Form
            fields={configFormFields}
            onSubmit={handleConfigFormSubmit}
            initialValues={{
              name: '张三',
              email: 'zhangsan@example.com',
              age: 25,
              gender: 'male',
              interests: ['programming', 'design'],
              education: 'bachelor',
              birthday: '1999-01-01',
              skills: 7,
              agree: true,
              bio: '我是一名热爱编程的开发工程师'
            }}
            gridColumns={2}
            gap="medium"
            submitButton={{
              text: '提交测试数据',
              color: 'success' as const
            }}
            validateOnSubmit={true}
            validateOnChange={false}
            validateOnBlur={true}
          />
        </div>

        {/* 新表单演示 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 全新表单（测试表单验证）</h2>
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              这个表单是全新的，没有预填数据，测试表单的默认状态和验证功能
            </p>
          </div>

          <Form
            fields={configFormFields}
            onSubmit={handleConfigFormSubmit}
            gridColumns={2}
            gap="medium"
            submitButton={{
              text: '提交全新表单',
              color: 'primary' as const
            }}
            resetButton={{
              text: '重置表单',
              color: 'secondary' as const
            }}
            validateOnSubmit={true}
            validateOnChange={false}
            validateOnBlur={true}
          />
        </div>

        {/* 提交结果显示 */}
        {isSubmitted && submitResult && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  表单提交成功！
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  您的表单数据已成功提交，以下是提交的内容：
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border overflow-auto">
              <h4 className="text-sm font-medium text-gray-800 mb-2">📋 提交的数据：</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-green-600">此消息将在8秒后自动消失</span>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmitResult(null);
                }}
                className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              >
                立即关闭
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-3">💡 支持的字段类型：</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">input - 文本输入</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">email - 邮箱输入</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">password - 密码</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">number - 数字</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">textarea - 多行文本</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">select - 下拉选择</span>
            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">radio - 单选框</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">checkbox - 复选框</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded">file - 文件上传</span>
            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded">date - 日期选择</span>
            <span className="px-2 py-1 bg-lime-100 text-lime-700 rounded">range - 范围滑块</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-800 mb-2">✅ 验证规则：</h4>
          <div className="text-sm text-green-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">基础验证：</h5>
                <ul className="text-xs space-y-1">
                  <li>• required - 必填验证</li>
                  <li>• minLength/maxLength - 长度验证</li>
                  <li>• min/max - 数值范围</li>
                  <li>• pattern - 正则表达式</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">高级验证：</h5>
                <ul className="text-xs space-y-1">
                  <li>• custom - 自定义验证函数</li>
                  <li>• 异步验证支持</li>
                  <li>• 跨字段验证</li>
                  <li>• 实时错误反馈</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
