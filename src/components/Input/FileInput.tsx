import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import Input from './Input';
import { Button } from '../Commom';
import { Image } from '../Commom';

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  modifiedTime: string;
  isDirectory: boolean;
}

export type FileInputMode = 'single' | 'multiple';

export interface FileInputProps {
  value?: string | FileInfo[];
  disabled?: boolean;
  mode?: FileInputMode;
  accept?: string; // 文件类型筛选，如 ".txt,.pdf,images/*"
  directory?: boolean; // 是否选择文件夹
  buttonText?: string;
  placeholder?: string;
  showFileInfo?: boolean;
  showImagePreview?: boolean; // 是否显示图片预览
  previewMaxWidth?: number; // 图片预览最大宽度
  previewMaxHeight?: number; // 图片预览最大高度
  onChange?: (files: string | FileInfo[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

const FileInput = forwardRef<HTMLDivElement, FileInputProps>(({
  value,
  disabled = false,
  mode = 'single',
  accept,
  directory = false,
  buttonText = '选择文件',
  placeholder = '请选择文件...',
  showFileInfo = true,
  showImagePreview = false,
  previewMaxWidth = 100,
  previewMaxHeight = 100,
  onChange,
  onError,
  className = '',
  ...props
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const [previewLoading, setPreviewLoading] = useState<{ [key: string]: boolean }>({});

  // 获取文件名列表用于显示
  const getDisplayNames = () => {
    if (!value) return placeholder;

    if (mode === 'multiple') {
      const files = value as FileInfo[];
      if (Array.isArray(files) && files.length > 0) {
        if (files.length === 1) {
          return files[0].name;
        } else {
          return `${files[0].name} 等 ${files.length} 个文件`;
        }
      }
      return placeholder;
    } else {
      // single mode
      if (typeof value === 'string') {
        const pathParts = value.split(/[/\\]/);
        return pathParts[pathParts.length - 1] || placeholder;
      } else {
        const files = value as FileInfo[];
        return Array.isArray(files) && files.length > 0 ? files[0].name : placeholder;
      }
    }
  };

  // 检查文件扩展名是否被接受
  const isAcceptedFileType = (filePath: string) => {
    if (!accept) return true;

    const fileName = filePath.toLowerCase();
    const accepts = accept.split(',').map(a => a.trim().toLowerCase());

    return accepts.some(acceptType => {
      if (acceptType.startsWith('.')) {
        // 扩展名匹配
        return fileName.endsWith(acceptType);
      } else if (acceptType === 'images/*') {
        // 图片类型
        return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
      } else if (acceptType === 'videos/*') {
        // 视频类型
        return /\.(mp4|avi|mov|mkv|wmv|flv)$/i.test(fileName);
      } else if (acceptType === 'audio/*') {
        // 音频类型
        return /\.(mp3|wav|aac|flac|ogg|wma)$/i.test(fileName);
      } else if (acceptType === 'documents/*') {
        // 文档类型
        return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i.test(fileName);
      } else if (acceptType.includes('*')) {
        // 通配符匹配
        const pattern = acceptType.replace(/\*/g, '.*');
        const regex = new RegExp(pattern, 'i');
        return regex.test(fileName);
      }
      return false;
    });
  };

  // 处理文件选择
  const handleSelect = useCallback(async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      setErrorText('');

      if (!(window as any).electronAPI) {
        throw new Error('Electron API not available');
      }

      // 构建对话框选项
      const openDialogOptions: Electron.OpenDialogOptions = {
        properties: (directory
          ? ['openDirectory']
          : mode === 'multiple'
            ? ['openFile', 'multiSelections']
            : ['openFile']) as any,
        filters: []
      };

      // 添加创建目录按钮（Windows 和 Linux）
      try {
        const platform = await (window as any).electronAPI.getPlatform();
        if (!(platform === 'darwin')) {
          (openDialogOptions.properties! as any).push('createDirectory');
        }
      } catch (error) {
        // 如果获取平台信息失败，默认添加createDirectory（适用大多数平台）
        (openDialogOptions.properties! as any).push('createDirectory');
      }

      // 设置文件过滤
      if (accept && !directory) {
        // 解析 accept 字符串并转换为 Electron 过滤器格式
        const filters: Electron.FileFilter[] = [];
        const accepts = accept.split(',').map(a => a.trim());

        accepts.forEach(acceptType => {
          if (acceptType.startsWith('.')) {
            // 单个扩展名
            const ext = acceptType.substring(1);
            filters.push({
              name: `${ext.toUpperCase()} 文件`,
              extensions: [ext]
            });
          } else if (acceptType === 'images/*') {
            filters.push({
              name: '图片文件',
              extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
            });
          } else if (acceptType === 'videos/*') {
            filters.push({
              name: '视频文件',
              extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv']
            });
          } else if (acceptType === 'audio/*') {
            filters.push({
              name: '音频文件',
              extensions: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma']
            });
          } else if (acceptType === 'documents/*') {
            filters.push({
              name: '文档文件',
              extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
            });
          }
        });

        if (filters.length > 0) {
          openDialogOptions.filters = filters;
        }
      }

      // 显示文件选择对话框
      const result = await (window as any).electronAPI.showOpenDialog(openDialogOptions);

      if (!result.canceled && result.filePaths.length > 0) {
        // 验证和收集文件信息
        const fileInfos: FileInfo[] = [];
        let hasError = false;

        for (const filePath of result.filePaths) {
          const validation = await (window as any).electronAPI.validateFilePath(filePath);

          if (validation.exists) {
            if (!directory && !isAcceptedFileType(filePath)) {
              const errorMsg = `文件类型不被接受: ${filePath}`;
              setErrorText(errorMsg);
              if (onError) onError(errorMsg);
              hasError = true;
              break;
            }

            fileInfos.push({
              path: filePath,
              name: filePath.split(/[/\\]/).pop() || filePath,
              size: validation.size || 0,
              modifiedTime: validation.modifiedTime || new Date().toISOString(),
              isDirectory: validation.isDirectory || false
            });
          } else {
            const errorMsg = `文件不存在或无法访问: ${filePath}`;
            setErrorText(errorMsg);
            if (onError) onError(errorMsg);
            hasError = true;
            break;
          }
        }

        if (!hasError) {
          if (mode === 'multiple') {
            if (onChange) onChange(fileInfos);
          } else {
            if (onChange) onChange(fileInfos[0].path);
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setErrorText(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, mode, directory, accept, onChange, onError]);

  // 清除选择
  const handleClear = useCallback(() => {
    if (mode === 'multiple') {
      if (onChange) onChange([]);
    } else {
      if (onChange) onChange('');
    }
  }, [mode, onChange]);

  // 检查文件是否是图片
  const isImageFile = (filePath: string) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  };

  // 加载图片预览
  const loadImagePreviews = useCallback(async () => {
    if (!showImagePreview || !value) return;

    let filesToPreview: FileInfo[] = [];

    if (mode === 'multiple') {
      const files = value as FileInfo[];
      if (Array.isArray(files)) {
        filesToPreview = files.filter(f => !f.isDirectory && isImageFile(f.path));
      }
    } else {
      if (typeof value === 'string') {
        // 单文件模式且是string路径，可能需要从外部加载
        if (isImageFile(value)) {
          try {
            const validation = await (window as any).electronAPI.validateFilePath(value);
            if (validation.exists) {
              filesToPreview = [{
                path: value,
                name: value.split(/[/\\]/).pop() || value,
                size: validation.size || 0,
                modifiedTime: validation.modifiedTime || new Date().toISOString(),
                isDirectory: false
              }];
            }
          } catch (error) {
            // 忽略错误
          }
        }
      } else {
        const files = value as FileInfo[];
        if (Array.isArray(files) && files.length > 0 && !files[0].isDirectory && isImageFile(files[0].path)) {
          filesToPreview = [files[0]];
        }
      }
    }

    // 加载图片预览
    for (const file of filesToPreview) {
      if (!imagePreviews[file.path] && !previewLoading[file.path]) {
        setPreviewLoading(prev => ({ ...prev, [file.path]: true }));

        try {
          const result = await (window as any).electronAPI.readImageFile(file.path);
          if (result.success && result.data) {
            setImagePreviews(prev => ({ ...prev, [file.path]: result.data }));
          }
        } catch (error) {
          console.warn('Failed to load image preview:', file.path, error);
        } finally {
          setPreviewLoading(prev => ({ ...prev, [file.path]: false }));
        }
      }
    }
  }, [showImagePreview, value, mode, imagePreviews, previewLoading]);

  // 当value变化时加载图片预览
  useEffect(() => {
    loadImagePreviews();
  }, [loadImagePreviews]);

  // 显示文件信息
  const renderFileInfo = () => {
    if (!showFileInfo || !value) return null;

    if (mode === 'multiple') {
      const files = value as FileInfo[];
      if (Array.isArray(files) && files.length > 1) {
        return (
          <div className="mt-2 text-sm text-gray-600">
            {files.map((file, index) => (
              <div key={index} className="mb-1">
                {file.name} {file.isDirectory ? '(文件夹)' : `(${(file.size / 1024).toFixed(1)} KB)`}
              </div>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  // 渲染图片预览
  const renderImagePreviews = () => {
    console.log('[renderImagePreviews]', value)
    if (!showImagePreview) return null;

    let filesToShow: FileInfo[] = [];

    if (mode === 'multiple') {
      const files = value as FileInfo[];
      if (Array.isArray(files)) {
        filesToShow = files.filter(f => !f.isDirectory && isImageFile(f.path));
      }
    } else {
      if (typeof value === 'string') {
        // 单文件模式且是string路径，可能需要从外部加载
        if (isImageFile(value)) {
          filesToShow = [{
            path: value,
            name: value.split(/[/\\]/).pop() || value,
            size: 0,
            modifiedTime: '',
            isDirectory: false
          }];
        }
      } else {
        const files = value as FileInfo[];
        if (Array.isArray(files) && files.length > 0 && !files[0].isDirectory && isImageFile(files[0].path)) {
          filesToShow = [files[0]];
        }
      }
    }

    if (filesToShow.length === 0) return null;

    const maxToShow = 3; // 最多显示3个预览
    const previewFiles = filesToShow.slice(0, maxToShow);

    return (
      <div className="mt-3 flex gap-2 flex-wrap">
        {previewFiles.map((file, index) => {
          const previewSrc = imagePreviews[file.path];
          const isLoading = previewLoading[file.path];
          const showExtraCount = filesToShow.length > maxToShow && index === maxToShow - 1;

          return (
            <div key={file.path} className="relative">
              <Image
                src={previewSrc}
                alt={file.name}
                width={previewMaxWidth}
                height={previewMaxHeight}
                fit="cover"
                showLoading={true}
                showError={false}
                showPlaceholder={false}
                round={true}
                className="shadow-sm"
                style={{ maxWidth: `${previewMaxWidth}px`, maxHeight: `${previewMaxHeight}px` }}
                title={file.name}
              />
              {showExtraCount && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-medium">+{filesToShow.length - maxToShow}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={ref} className={`w-full ${className}`} {...props}>
      <div className="flex gap-2">
        {/* 文件显示输入框 */}
        <div className="flex-1">
          <Input
            fullWidth
            readOnly
            value={getDisplayNames()}
            placeholder={placeholder}
            disabled={disabled}
            state={errorText ? 'error' : 'normal'}
            helperText={errorText || undefined}
            className="[-webkit-app-region:no-drag]"
          />
        </div>

        {/* 选择按钮 */}
        <Button
          onClick={handleSelect}
          disabled={disabled || isLoading}
          loading={isLoading}
          color="primary"
          className="[-webkit-app-region:no-drag]"
        >
          {buttonText}
        </Button>

        {/* 清除按钮 */}
        {value && (
          <Button
            onClick={handleClear}
            disabled={disabled}
            variant="text"
            color="error"
            className="[-webkit-app-region:no-drag]"
            title="清除选择"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* 文件详细信息 */}
      {renderFileInfo()}

      {/* 图片预览 */}
      {renderImagePreviews()}
    </div>
  );
});

FileInput.displayName = 'FileInput';

export default FileInput;
