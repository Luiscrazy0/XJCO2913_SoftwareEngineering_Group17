import React, { useEffect, useRef, useState } from 'react';
import { MapConfig, MarkerConfig } from '../../types/amap';

interface AmapMapProps {
  // 地图配置
  config?: MapConfig;
  // 标记点列表
  markers?: MarkerConfig[];
  // 选中的标记点
  selectedMarker?: MarkerConfig | null;
  // 用户位置
  userLocation?: { latitude: number; longitude: number } | null;
  // 事件回调
  onMarkerClick?: (marker: MarkerConfig, event: any) => void;
  onMapClick?: (event: any) => void;
  // 样式
  className?: string;
  style?: React.CSSProperties;
  // 加载状态
  loading?: boolean;
  // 错误处理
  onError?: (error: Error) => void;
}

const AmapMap: React.FC<AmapMapProps> = ({
  config = {},
  markers = [],
  selectedMarker = null,
  userLocation = null,
  onMarkerClick,
  onMapClick,
  className = '',
  style = {},
  loading = false,
  onError,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 默认配置
  const defaultConfig: MapConfig = {
    zoom: 13,
    center: [121.4737, 31.2304], // 上海中心坐标
    viewMode: '2D',
    mapStyle: 'amap://styles/normal',
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 加载高德地图JS API
  useEffect(() => {
    const loadAmapScript = () => {
      // 检查是否已加载
      if (window.AMap) {
        setIsLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_AMAP_JS_KEY || 'your_js_api_key_here';
      const scriptId = 'amap-script';

      // 如果脚本已存在，直接使用
      if (document.getElementById(scriptId)) {
        // 等待脚本加载完成
        const checkLoaded = () => {
          if (window.AMap) {
            setIsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // 创建脚本元素
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
      script.async = true;
      
      script.onload = () => {
        console.log('高德地图JS API加载成功');
        setIsLoaded(true);
      };
      
      script.onerror = (err) => {
        const errorMsg = '高德地图JS API加载失败';
        console.error(errorMsg, err);
        setError(errorMsg);
        if (onError) {
          onError(new Error(errorMsg));
        }
      };

      document.head.appendChild(script);
    };

    loadAmapScript();
  }, [onError]);

  // 初始化地图
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // 创建地图实例
      mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
        zoom: finalConfig.zoom,
        center: finalConfig.center,
        viewMode: finalConfig.viewMode,
        mapStyle: finalConfig.mapStyle,
      });

      // 添加地图点击事件
      if (onMapClick) {
        mapInstanceRef.current.on('click', (event: any) => {
          onMapClick(event);
        });
      }

      console.log('高德地图初始化成功');
    } catch (err) {
      const errorMsg = '高德地图初始化失败';
      console.error(errorMsg, err);
      setError(errorMsg);
      if (onError) {
        onError(err as Error);
      }
    }
  }, [isLoaded, finalConfig, onMapClick, onError]);

  // 更新标记点
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // 清除现有标记点
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.remove(marker);
    });
    markersRef.current = [];

    // 添加用户位置标记
    if (userLocation && userMarkerRef.current) {
      mapInstanceRef.current.remove(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      try {
        const userPosition: [number, number] = [userLocation.longitude, userLocation.latitude];
        userMarkerRef.current = new window.AMap.Marker({
          position: userPosition,
          title: '您的位置',
          content: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">👤</div>',
          offset: new window.AMap.Pixel(-12, -12),
          zIndex: 100,
        });
        
        userMarkerRef.current.setMap(mapInstanceRef.current);
      } catch (err) {
        console.error('添加用户位置标记失败:', err);
      }
    }

    // 添加站点标记
    markers.forEach((markerConfig, index) => {
      try {
        const marker = new window.AMap.Marker({
          position: markerConfig.position,
          title: markerConfig.title || `站点 ${index + 1}`,
          content: createMarkerContent(markerConfig, index, markerConfig === selectedMarker),
          offset: markerConfig.offset ? new window.AMap.Pixel(markerConfig.offset[0], markerConfig.offset[1]) : new window.AMap.Pixel(-15, -15),
          zIndex: markerConfig === selectedMarker ? 50 : 10,
        });

        // 添加点击事件
        marker.on('click', (event: any) => {
          if (onMarkerClick) {
            onMarkerClick(markerConfig, event);
          }
          
          // 显示信息窗口
          if (markerConfig.content && infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = new window.AMap.InfoWindow({
              content: markerConfig.content,
              offset: new window.AMap.Pixel(0, -30),
            });
            infoWindowRef.current.open(mapInstanceRef.current, marker.getPosition());
          }
        });

        marker.setMap(mapInstanceRef.current);
        markersRef.current.push(marker);
      } catch (err) {
        console.error(`添加标记点 ${index} 失败:`, err);
      }
    });

    // 如果有选中的标记点，居中显示
    if (selectedMarker && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(selectedMarker.position);
      mapInstanceRef.current.setZoom(15);
    }
  }, [isLoaded, markers, selectedMarker, userLocation, onMarkerClick]);

  // 创建标记点内容
  const createMarkerContent = (markerConfig: MarkerConfig, index: number, isSelected: boolean) => {
    const color = isSelected ? '#ff6a00' : (markerConfig.extData?.availableCount > 0 ? '#10b981' : '#ef4444');
    const borderColor = isSelected ? '#ff6a00' : '#ffffff';
    
    return `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        ${index + 1}
      </div>
    `;
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={style}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mclaren-orange)]"></div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={style}>
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-medium mb-2">地图加载失败</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px', ...style }}
      />
      
      {/* 地图图例 */}
      <div className="absolute bottom-4 left-4 bg-slate-900/85 text-slate-100 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>您的位置</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>有可用车辆</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>无可用车辆</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[var(--mclaren-orange)] rounded-full mr-2"></div>
            <span>选中站点</span>
          </div>
        </div>
      </div>

      {/* 加载遮罩 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mclaren-orange)] mb-4"></div>
            <p className="text-gray-700">正在加载地图...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmapMap;