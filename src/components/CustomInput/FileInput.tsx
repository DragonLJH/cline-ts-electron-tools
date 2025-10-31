import React, { useRef, useState } from 'react';
import CustomInput, { CustomInputProps } from './CustomInput';

export interface FileInputProps extends Omit<CustomInputProps,
  'value' | 'onChange' | 'type' | 'leftIcon' | 'rightIcon'> {
  onFileSelect?: (files: FileList | null) => void;
  onFileChange?: (filePath?: string) => void;
  accept?: string;
  multiple?: boolean;
  showFileName?: boolean;
  showFileSize?: boolean;
  fileButtonText?: string;
  clearable?: boolean;
}

/**
 * FileInput 组件 - 文件选择输入框
 *
 * 特性:
 * - 支持单文件和多文件选择
 * - 显示文件路径或文件名
 * - 文件大小显示
 * - 可清除选择
 * - 自定义文件类型过滤
 * - drag & drop 支持
 */
const FileInput: React.FC<FileInputProps> = ({
  onFileSelect,
  onFileChange,
  accept = '*',
  multiple = false,
  showFileName = true,
  showFileSize = true,
  fileButtonText = '选择文件',
  clearable = true,
  placeholder = '未选择文件',
  disabled,
  error,
  ...rest
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filePath, setFilePath] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件显示信息
  const getFileDisplayInfo = (): string => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return placeholder;
    }

    if (selectedFiles.length === 1) {
      const file = selectedFiles[0];
      return showFileName ? file.name : filePath || file.name;
    }

    return `已选择 ${selectedFiles.length} 个文件`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFiles(files);

    if (files && files.length > 0) {
      // 在 Electron 中尝试获取文件路径
      if (files.length === 1 && (window as any).electronAPI) {
        try {
          // 假设有获取文件路径的API
          const path = (window as any).electronAPI.getFilePaths?.(files);
          if (path && path.length > 0) {
            setFilePath(path[0]);
            onFileChange?.(path[0]);
          }
        } catch (err) {
          // 普通浏览器环境
          setFilePath('');
          onFileChange?.(files[0].name);
        }
      }
    }

    onFileSelect?.(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFiles(null);
    setFilePath('');
    onFileSelect?.(null);
    onFileChange?.(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);

      // 处理拖拽的文件
      if ((window as any).electronAPI && files.length === 1) {
        try {
          const path = (window as any).electronAPI.getFilePaths?.(files);
          if (path && path.length > 0) {
            setFilePath(path[0]);
            onFileChange?.(path[0]);
          }
        } catch (err) {
          setFilePath('');
          onFileChange?.(files[0].name);
        }
      }

      onFileSelect?.(files);
    }
  };

  // 文件选择按钮
  const fileButton = (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={disabled}
      className={`
        flex items-center justify-center px-4 py-2 border border-gray-300
        bg-white text-sm font-medium text-gray-700 rounded-md
        hover:bg-gray-50 hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
        whitespace-nowrap
      `}
      aria-label="选择文件"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      {fileButtonText}
    </button>
  );

  // 清除按钮
  const clearButton = clearable && selectedFiles && selectedFiles.length > 0 ? (
    <button
      type="button"
      onClick={handleClear}
      disabled={disabled}
      className={`
        flex items-center justify-center w-5 h-5 text-gray-400
        hover:text-gray-600 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
      `}
      aria-label="清除文件"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  ) : null;

  // 文件大小显示
  const fileSizeInfo = showFileSize && selectedFiles && selectedFiles.length === 1 ? (
    <div className="text-xs text-gray-500 mt-1">
      {formatFileSize(selectedFiles[0].size)}
    </div>
  ) : null;

  return (
    <div className="file-input-wrapper">
      <div className="flex items-center gap-3">
        {/* 文件路径显示输入框 */}
        <div className="flex-1">
          <CustomInput
            value={getFileDisplayInfo()}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            readOnly
            variant="outlined"
            rightIcon={clearButton}
            {...rest}
          />
          {fileSizeInfo}
        </div>

        {/* 文件选择按钮 */}
        {fileButton}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* 拖拽区域提示（可选） */}
      {isDragOver && (
        <div
          className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg
                     flex items-center justify-center text-blue-600 font-medium z-10 pointer-events-none"
        >
          释放鼠标以下载文件
        </div>
      )}

      {/* 隐藏的拖拽区域 - 只处理拖拽，不处理点击 */}
      <div
        className="absolute inset-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
};

FileInput.displayName = 'FileInput';

export default FileInput;
