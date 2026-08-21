export interface ChartPoint {
  time: number; // Unix timestamp (в секундах или миллисекундах)
  value: number;
}

export interface ChartSeries {
  id: string;
  name: string;
  color: string; // HEX или CSS-цвет, например '#00f5d4'
  data: ChartPoint[];
  gradient?: boolean; // Заливка градиентом под линией
  strokeWidth?: number; // Толщина линии (по умолчанию 2)
  dimmed?: boolean; // Приглушить ли линию
}

export interface HoverPointInfo {
  seriesId: string;
  name: string;
  color: string;
  value: number;
  yPx: number;
}

export interface HoverInfo {
  timestamp: number;
  formattedTime: string;
  xPx: number;
  points: HoverPointInfo[];
}

export type TimeStep = 'auto' | '1m' | '5m' | '10m' | '30m' | '1h' | '1d' | '1w' | '1M';

export interface ChartMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface TimeChartProps {
  series: ChartSeries[];
  height?: number;
  className?: string;

  // Опции линий
  smooth?: boolean; // Общее сглаживание для всех линий (по умолчанию true)
  lastPoint?: boolean; // Показывать ли точку на конце линий в состоянии покоя (по умолчанию берется из серии)

  // Ось X (Время)
  timeStep?: TimeStep;
  formatTime?: (timestamp: number) => string;
  formatTooltipTime?: (timestamp: number) => string;

  // Ось Y (Значения)
  showYAxis?: boolean; // Отображать ли шкалу Y и пунктирные линии (по умолчанию true)
  yMin?: number; // Фиксированный минимум
  yMax?: number; // Фиксированный максимум
  yPaddingRatio?: number; // Коэффициент отступа сверху и снизу (по умолчанию 0.1)
  yTicksCount?: number; // Желаемое количество делений на оси Y (по умолчанию 5)
  formatValue?: (value: number) => string; // Форматирование чисел (например, v => `${v}%`)

  // Интерактивность и hover
  showInternalTooltip?: boolean; // Отображать ли значения и время прямо на графике (по умолчанию true)
  showCrosshair?: boolean; // Отображать ли вертикальную линию курсора (по умолчанию true)
  dimAfterCursor?: boolean; // Приглушать ли правую часть графика после курсора при hover (по умолчанию false)
  tooltipLayout?: 'column' | 'row'; // Формат бейджей тултипа: колонка (под названием) или строка (в одну строку)
  onHover?: (info: HoverInfo | null) => void; // Коллбэк для передачи данных во внешние компоненты

  // Отступы
  margins?: ChartMargins;
}
