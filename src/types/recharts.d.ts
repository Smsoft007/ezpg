declare module 'recharts' {
  import * as React from 'react';

  export interface LineProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    name?: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    strokeDasharray?: string;
    dot?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    activeDot?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    label?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    points?: any[];
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    id?: string;
    connectNulls?: boolean;
    unit?: string | number;
  }

  export interface XAxisProps {
    dataKey?: string;
    hide?: boolean;
    height?: number;
    tickCount?: number;
    tickFormatter?: (value: any) => string;
    stroke?: string;
    strokeWidth?: number;
    fontSize?: number | string;
    padding?: { left?: number; right?: number };
    allowDataOverflow?: boolean;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    type?: 'number' | 'category';
    domain?: [number | string, number | string] | 'auto' | 'dataMin' | 'dataMax';
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    tick?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    minTickGap?: number;
    ticks?: any[];
    tickSize?: number;
    mirror?: boolean;
    reversed?: boolean;
    label?: string | number | React.ReactElement | object;
    allowDecimals?: boolean;
    allowDuplicatedCategory?: boolean;
  }

  export interface YAxisProps {
    dataKey?: string;
    hide?: boolean;
    width?: number;
    tickCount?: number;
    tickFormatter?: (value: any) => string;
    stroke?: string;
    strokeWidth?: number;
    fontSize?: number | string;
    padding?: { top?: number; bottom?: number };
    top?: number;
    bottom?: number;
    allowDataOverflow?: boolean;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    type?: 'number' | 'category';
    domain?: [number | string, number | string] | 'auto' | 'dataMin' | 'dataMax';
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    tick?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    minTickGap?: number;
    ticks?: any[];
    tickSize?: number;
    mirror?: boolean;
    reversed?: boolean;
    label?: string | number | React.ReactElement | object;
    allowDecimals?: boolean;
    allowDuplicatedCategory?: boolean;
    angle?: number;
    textAnchor?: 'start' | 'middle' | 'end';
    orientation?: 'left' | 'right';
  }

  export interface TooltipProps {
    content?: React.ReactElement | ((props: any) => React.ReactNode);
    viewBox?: { x?: number; y?: number; width?: number; height?: number };
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    active?: boolean;
    separator?: string;
    offset?: number;
    wrapperStyle?: React.CSSProperties;
    cursor?: boolean | React.ReactElement | object;
    coordinate?: { x?: number; y?: number };
    position?: { x?: number; y?: number };
    isAnimationActive?: boolean;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationDuration?: number;
    filterNull?: boolean;
    formatter?: (value: any, name: string, props: any) => [any, any];
    labelFormatter?: (label: any) => React.ReactNode;
    itemSorter?: (a: any, b: any) => number;
    contentStyle?: React.CSSProperties;
    itemStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
  }

  export interface CartesianGridProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
    horizontalCoordinatesGenerator?: (props: any) => number[];
    verticalCoordinatesGenerator?: (props: any) => number[];
    stroke?: string;
    strokeDasharray?: string;
    fill?: string;
  }

  export interface LegendProps {
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    iconSize?: number;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    payload?: Array<{ value: any; id: string; type: string; color: string }>;
    formatter?: (value: any, entry: any, index: number) => React.ReactNode;
    onClick?: (event: any) => void;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
    content?: React.ReactElement | ((props: any) => React.ReactNode);
    wrapperStyle?: React.CSSProperties;
  }

  export interface ResponsiveContainerProps {
    aspect?: number;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: number;
    debounce?: number;
    id?: string;
    className?: string;
    children?: React.ReactNode;
  }

  export interface LineChartProps {
    layout?: 'horizontal' | 'vertical';
    syncId?: string;
    width?: number;
    height?: number;
    data?: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    className?: string;
    onClick?: (data: any, index: number) => void;
    onMouseLeave?: (data: any) => void;
    onMouseEnter?: (data: any) => void;
    onMouseMove?: (data: any) => void;
    onMouseDown?: (data: any) => void;
    onMouseUp?: (data: any) => void;
    reverseStackOrder?: boolean;
    barCategoryGap?: number | string;
    barGap?: number | string;
    barSize?: number | string;
    maxBarSize?: number;
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    baseValue?: number | 'auto' | 'dataMin' | 'dataMax';
    children?: React.ReactNode;
  }

  export interface PieChartProps {
    width?: number;
    height?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    className?: string;
    onClick?: (data: any, index: number) => void;
    onMouseLeave?: (data: any) => void;
    onMouseEnter?: (data: any) => void;
    onMouseMove?: (data: any) => void;
    onMouseDown?: (data: any) => void;
    onMouseUp?: (data: any) => void;
    children?: React.ReactNode;
  }

  export interface PieProps {
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    paddingAngle?: number;
    cornerRadius?: number;
    dataKey: string;
    nameKey?: string;
    valueKey?: string;
    data?: any[];
    minAngle?: number;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    label?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    labelLine?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | object;
    activeIndex?: number | number[];
    activeShape?: React.ReactElement | ((props: any) => React.ReactNode) | object;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    id?: string;
    onClick?: (data: any, index: number) => void;
    onMouseLeave?: (data: any) => void;
    onMouseEnter?: (data: any) => void;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    children?: React.ReactNode;
  }

  export interface CellProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    opacity?: number;
  }

  export class Line extends React.Component<LineProps> {}
  export class XAxis extends React.Component<XAxisProps> {}
  export class YAxis extends React.Component<YAxisProps> {}
  export class Tooltip extends React.Component<TooltipProps> {}
  export class CartesianGrid extends React.Component<CartesianGridProps> {}
  export class Legend extends React.Component<LegendProps> {}
  export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}
  export class LineChart extends React.Component<LineChartProps> {}
  export class PieChart extends React.Component<PieChartProps> {}
  export class Pie extends React.Component<PieProps> {}
  export class Cell extends React.Component<CellProps> {}
}
