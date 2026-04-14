// 高德地图类型定义
declare global {
  interface Window {
    AMap: any;
  }
}

// 地图配置接口
export interface MapConfig {
  zoom?: number;
  center?: [number, number];
  viewMode?: '2D' | '3D';
  mapStyle?: string;
}

// 标记点接口
export interface MarkerConfig {
  position: [number, number];
  title?: string;
  content?: string;
  icon?: string;
  size?: [number, number];
  offset?: [number, number];
  zIndex?: number;
  draggable?: boolean;
  cursor?: string;
  visible?: boolean;
  label?: {
    content: string;
    offset: [number, number];
  };
  extData?: any;
}

// 信息窗口接口
export interface InfoWindowConfig {
  position: [number, number];
  content: string;
  size?: [number, number];
  offset?: [number, number];
  isCustom?: boolean;
  closeWhenClickMap?: boolean;
}

// 地图事件类型
export type MapEventType = 
  | 'click'
  | 'dblclick'
  | 'rightclick'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'dragstart'
  | 'dragging'
  | 'dragend'
  | 'zoomchange'
  | 'zoomstart'
  | 'zoomend'
  | 'movestart'
  | 'moveend';

// 标记点事件类型
export type MarkerEventType = 
  | 'click'
  | 'dblclick'
  | 'rightclick'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'dragstart'
  | 'dragging'
  | 'dragend';