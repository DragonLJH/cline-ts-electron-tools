import React, { forwardRef, useState, useEffect, useCallback, CSSProperties, useRef, useImperativeHandle } from 'react';

export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ImageObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ImageDisplayMode = 'img' | 'background';

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onLoad' | 'onError'> {
  src?: string | string[];
  alt?: string;
  width?: string | number;
  height?: string | number;
  fit?: ImageFit;
  position?: ImagePosition;
  objectFit?: ImageObjectFit;
  displayMode?: ImageDisplayMode;
  showLoading?: boolean;
  showError?: boolean;
  retry?: number; // 重试次数
  retryDelay?: number; // 重试延迟(ms)
  showPlaceholder?: boolean;
  placeholder?: React.ReactNode | string;
  errorText?: string | React.ReactNode;
  loadingText?: string | React.ReactNode;
  round?: boolean | string | number; // 是否圆形或圆角大小
  circle?: boolean;
  lazy?: boolean; // 是否懒加载
  preview?: boolean; // 点击预览
  previewSrcList?: string[]; // 预览图片列表
  rootMargin?: string; // IntersectionObserver rootMargin
  threshold?: number | number[]; // IntersectionObserver threshold
  onLoad?: (success: boolean, event?: Event) => void;
  onError?: (error: Error, event?: Event) => void;
  className?: string;
  style?: CSSProperties;
}

interface ImageState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
  loadCount: number;
}

const Image = forwardRef<HTMLDivElement, ImageProps>(({
  src,
  alt = '',
  width = 'auto',
  height = 'auto',
  fit = 'fill',
  position = 'center',
  objectFit = 'fill',
  displayMode = 'img',
  showLoading = true,
  showError = true,
  retry = 3,
  retryDelay = 1000,
  showPlaceholder = true,
  placeholder,
  errorText,
  loadingText,
  round = false,
  circle = false,
  lazy = false,
  preview = false,
  previewSrcList = [],
  rootMargin = '50px',
  threshold = 0.1,
  onLoad,
  onError,
  className = '',
  style = {},
  ...props
}, ref) => {
  const [imageState, setImageState] = useState<ImageState>({
    loading: true,
    error: false,
    loaded: false,
    loadCount: 0
  });

  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isInView, setIsInView] = useState(!lazy);
  const [previewVisible, setPreviewVisible] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 绑定 ref
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  // 获取图片源 (支持字符串和数组)
  const getImageSrc = useCallback(() => {
    if (typeof src === 'string') {
      return src;
    } else if (Array.isArray(src) && src.length > 0) {
      return src[0]; // 使用数组第一个
    }
    return '';
  }, [src]);

  // 懒加载 Intersection Observer
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold: Array.isArray(threshold) ? threshold : [threshold]
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, rootMargin, threshold]);

  // 重试加载图片
  const retryLoadImage = useCallback((currentRetry = imageState.loadCount) => {
    if (currentRetry >= retry) {
      setImageState(prev => ({ ...prev, error: true, loading: false }));
      return;
    }

    setTimeout(() => {
      setImageState(prev => ({ ...prev, loadCount: currentRetry + 1, error: false }));
    }, retryDelay);
  }, [retry, retryDelay, imageState.loadCount]);

  // 图片加载处理
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState(prev => ({
      ...prev,
      loading: false,
      loaded: true,
      error: false,
      loadCount: 0
    }));

    if (onLoad) {
      onLoad(true, event.nativeEvent);
    }
  }, [onLoad]);

  // 图片错误处理
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const error = new Error(`Failed to load image: ${currentSrc}`);

    setImageState(prev => ({
      ...prev,
      loading: false,
      error: true
    }));

    if (onError) {
      onError(error, event.nativeEvent);
    }

    if (imageState.loadCount < retry) {
      retryLoadImage(imageState.loadCount + 1);
    }
  }, [onError, currentSrc, retry, retryLoadImage, imageState.loadCount]);

  // 更新当前图片源
  useEffect(() => {
    const imgSrc = getImageSrc();
    if (imgSrc && imgSrc !== currentSrc) {
      setCurrentSrc(imgSrc);
      setImageState(prev => ({
        ...prev,
        loading: true,
        error: false,
        loaded: false,
        loadCount: 0
      }));
    }
  }, [src, currentSrc, getImageSrc]);

  // 生成容器样式
  const getContainerStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      width,
      height,
      ...style
    };

    // 圆角样式
    if (circle) {
      baseStyle.borderRadius = '50%';
    } else if (round) {
      baseStyle.borderRadius = typeof round === 'boolean' ? '6px' : `${round}px`;
    }

    return baseStyle;
  };

  // 生成图片样式
  const getImageStyle = (): CSSProperties => {
    if (displayMode === 'background') {
      return {
        backgroundImage: currentSrc ? `url(${currentSrc})` : undefined,
        backgroundSize: fit === 'fill' ? '100% 100%' : fit,
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100%'
      };
    }

    return {
      width: '100%',
      height: '100%',
      objectFit: objectFit as ImageObjectFit,
      objectPosition: position,
      borderRadius: circle ? '50%' : round ? (typeof round === 'boolean' ? '6px' : `${round}px`) : undefined
    };
  };

  // 处理点击预览
  const handlePreviewClick = useCallback(() => {
    if (preview && currentSrc) {
      setPreviewVisible(true);
    }
  }, [preview, currentSrc]);

  // 获取预览图片列表
  const getPreviewSrcList = useCallback(() => {
    if (previewSrcList.length > 0) {
      return previewSrcList;
    }
    if (typeof src === 'string') {
      return [src];
    }
    if (Array.isArray(src)) {
      return src;
    }
    return [];
  }, [previewSrcList, src]);

  // 默认占位符
  const defaultPlaceholder = (
    <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l4 4H8l2-2 2 2z" />
      </svg>
    </div>
  );

  // 默认加载状态
  const defaultLoading = loadingText || (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    </div>
  );

  // 默认错误状态
  const defaultError = errorText || (
    <div className="flex items-center justify-center w-full h-full bg-red-50 text-red-600">
      <div className="text-center">
        <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <p className="text-sm">图片加载失败</p>
      </div>
    </div>
  );

  // 容器类名
  const containerClassName = `
    relative overflow-hidden bg-transparent inline-block
    ${preview ? 'cursor-pointer' : ''}
    ${className}
  `;

  // 仅在懒加载时或非懒加载时显示图片
  const shouldShowImage = isInView && currentSrc && !imageState.loading && !imageState.error;

  return (
    <>
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={containerClassName}
        style={getContainerStyle()}
        onClick={handlePreviewClick}
      >
        {/* 占位符 */}
        {showPlaceholder && !imageState.loaded && !imageState.loading && !imageState.error && (
          <div className="absolute inset-0">
            {placeholder || defaultPlaceholder}
          </div>
        )}

        {/* 加载状态 */}
        {showLoading && imageState.loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80">
            {defaultLoading}
          </div>
        )}

        {/* 错误状态 */}
        {showError && imageState.error && (
          <div className="absolute inset-0">
            {defaultError}
          </div>
        )}

        {/* 图片显示 - img 标签模式 */}
        {displayMode === 'img' && shouldShowImage && (
          <img
            ref={imageRef}
            src={currentSrc}
            alt={alt}
            style={getImageStyle()}
            className="w-full h-full"
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...props}
          />
        )}

        {/* 图片显示 - 背景图模式 */}
        {displayMode === 'background' && shouldShowImage && (
          <div
            style={getImageStyle()}
            className="w-full h-full"
            {...(props as any)}
          />
        )}

        {/* 点击预览指示器 */}
        {preview && imageState.loaded && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 图片预览弹窗 (暂时用基本实现，后续可以扩展) */}
      {previewVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewVisible(false)}
        >
          <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentSrc}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-xl"
              onClick={() => setPreviewVisible(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
});

Image.displayName = 'Image';

export default Image;
