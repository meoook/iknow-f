import type { ChartPoint, TimeStep } from '../TimeChart.types';

/**
 * Приводит timestamp к миллисекундам, если он передан в секундах.
 */
export function normalizeTime(t: number): number {
  return t < 1e11 ? t * 1000 : t;
}

/**
 * Возвращает длительность шага в миллисекундах
 */
export function getStepMs(step: TimeStep): number | null {
  switch (step) {
    case '1m':
      return 60 * 1000;
    case '5m':
      return 5 * 60 * 1000;
    case '10m':
      return 10 * 60 * 1000;
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '1d':
      return 24 * 60 * 60 * 1000;
    case '1w':
      return 7 * 24 * 60 * 60 * 1000;
    case '1M':
      return 30 * 24 * 60 * 60 * 1000;
    case 'auto':
    default:
      return null;
  }
}

/**
 * Генерирует массив временных меток для оси X
 */
export function generateTimeTicks(
  minTime: number,
  maxTime: number,
  step: TimeStep = 'auto',
  targetCount = 5
): number[] {
  if (minTime >= maxTime) return [minTime];

  const duration = maxTime - minTime;
  const fixedStep = getStepMs(step);

  let stepMs = fixedStep;

  if (!stepMs) {
    // Автоматический подбор подходящего интервала
    const roughStep = duration / Math.max(1, targetCount);
    const candidateSteps = [
      10 * 1000, // 10s
      30 * 1000, // 30s
      60 * 1000, // 1m
      2 * 60 * 1000, // 2m
      5 * 60 * 1000, // 5m
      10 * 60 * 1000, // 10m
      15 * 60 * 1000, // 15m
      30 * 60 * 1000, // 30m
      60 * 60 * 1000, // 1h
      2 * 60 * 60 * 1000, // 2h
      6 * 60 * 60 * 1000, // 6h
      12 * 60 * 60 * 1000, // 12h
      24 * 60 * 60 * 1000, // 1d
      3 * 24 * 60 * 60 * 1000, // 3d
      7 * 24 * 60 * 60 * 1000, // 1w
      30 * 24 * 60 * 60 * 1000, // 1mo
    ];

    stepMs = candidateSteps.reduce((prev, curr) =>
      Math.abs(curr - roughStep) < Math.abs(prev - roughStep) ? curr : prev
    );
  }

  const ticks: number[] = [];
  const firstTick = Math.ceil(minTime / stepMs) * stepMs;

  for (let t = firstTick; t <= maxTime; t += stepMs) {
    ticks.push(t);
  }

  // Если тиков получилось слишком мало, возвращаем края
  if (ticks.length === 0) {
    return [minTime, maxTime];
  }

  return ticks;
}

/**
 * Стандартное форматирование метки времени на оси X:
 * строго либо только время (HH:mm), либо только дата (DD мес.)
 */
export function defaultFormatTime(timestamp: number, totalDurationMs?: number): string {
  const date = new Date(timestamp);
  const monthNames = [
    'янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня',
    'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
  ];

  // Если диапазон до 24-36 часов — показываем строго время (без даты)
  if (!totalDurationMs || totalDurationMs <= 36 * 60 * 60 * 1000) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Если диапазон больше — показываем строго дату (без времени)
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const currentYear = new Date().getFullYear();

  if (date.getFullYear() !== currentYear) {
    return `${day} ${month} ${date.getFullYear()}`;
  }

  return `${day} ${month}`;
}

/**
 * Форматирование даты и времени для тултипа (как на скриншоте: "авг. 21, 12:35")
 */
export function defaultFormatTooltipTime(timestamp: number): string {
  const date = new Date(timestamp);
  const monthNames = ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month} ${day}, ${hours}:${minutes}`;
}

/**
/**
 * Бинарный поиск и интерполяция значения для заданного времени:
 * - smooth: монотонный кубический сплайн (D3 curveMonotoneX)
 * - linear: линейная интерполяция между точками
 */
function sign(x: number): number {
  return x < 0 ? -1 : 1;
}

function slope3(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = (y1 - y0) / (h0 === 0 ? (h1 < 0 ? -1e-12 : 1e-12) : h0);
  const s1 = (y2 - y1) / (h1 === 0 ? (h0 < 0 ? -1e-12 : 1e-12) : h1);
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

function slope2(x0: number, y0: number, x1: number, y1: number, t: number): number {
  const h = x1 - x0;
  return h !== 0 ? (3 * (y1 - y0) / h - t) / 2 : t;
}

/**
 * Бинарный поиск и точная интерполяция значения и Y-координаты для заданного времени:
 * - smooth: точная кубическая кривая Безье (Fritsch-Carlson d3.curveMonotoneX)
 * - linear: линейная интерполяция между точками
 */
export function interpolateValueAtTime(
  data: ChartPoint[],
  targetTime: number,
  smooth = false,
  xScale?: (d: Date) => number,
  yScale?: { (v: number): number; invert?: (y: number) => number }
): { value: number; yPx?: number; exact: boolean } | null {
  if (!data || data.length === 0) return null;

  if (data.length === 1) {
    const val = data[0].v;
    return { value: val, yPx: yScale ? yScale(val) : undefined, exact: true };
  }

  const normTarget = normalizeTime(targetTime);
  const firstTime = normalizeTime(data[0].t);
  const lastTime = normalizeTime(data[data.length - 1].t);

  if (normTarget <= firstTime) {
    const val = data[0].v;
    return { value: val, yPx: yScale ? yScale(val) : undefined, exact: normTarget === firstTime };
  }
  if (normTarget >= lastTime) {
    const val = data[data.length - 1].v;
    return { value: val, yPx: yScale ? yScale(val) : undefined, exact: normTarget === lastTime };
  }

  // Бинарный поиск отрезка [left, right]
  let low = 0;
  let high = data.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = normalizeTime(data[mid].t);

    if (midTime === normTarget) {
      const val = data[mid].v;
      return { value: val, yPx: yScale ? yScale(val) : undefined, exact: true };
    } else if (midTime < normTarget) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const left = Math.max(0, high);
  const right = Math.min(data.length - 1, low);

  // Если сглаживание включено и переданы шкалы D3
  if (smooth && data.length > 2 && xScale && yScale && typeof yScale.invert === 'function') {
    const pts = data.map((d) => ({
      x: xScale(new Date(normalizeTime(d.t))),
      y: yScale(d.v),
    }));

    const n = pts.length;
    const tangents: number[] = new Array(n);

    for (let k = 1; k < n - 1; k++) {
      tangents[k] = slope3(
        pts[k - 1].x, pts[k - 1].y,
        pts[k].x, pts[k].y,
        pts[k + 1].x, pts[k + 1].y
      );
    }
    tangents[0] = slope2(pts[0].x, pts[0].y, pts[1].x, pts[1].y, tangents[1]);
    tangents[n - 1] = slope2(pts[n - 2].x, pts[n - 2].y, pts[n - 1].x, pts[n - 1].y, tangents[n - 2]);

    const targetX = xScale(new Date(normTarget));
    const x0 = pts[left].x;
    const x1 = pts[right].x;
    const dx = x1 - x0;

    if (dx === 0) {
      const val = data[left].v;
      return { value: val, yPx: pts[left].y, exact: true };
    }

    const u = Math.max(0, Math.min(1, (targetX - x0) / dx));
    const y0 = pts[left].y;
    const y1 = pts[right].y;
    const t0 = tangents[left];
    const t1 = tangents[right];

    const ya = y0 + (dx / 3) * t0;
    const yb = y1 - (dx / 3) * t1;

    const u1 = 1 - u;
    const interpolatedY =
      u1 * u1 * u1 * y0 +
      3 * u1 * u1 * u * ya +
      3 * u1 * u * u * yb +
      u * u * u * y1;

    const interpolatedVal = yScale.invert(interpolatedY);
    return { value: interpolatedVal, yPx: interpolatedY, exact: false };
  }

  // Линейная интерполяция между двумя соседними точками
  const t0 = normalizeTime(data[left].t);
  const t1 = normalizeTime(data[right].t);
  const v0 = data[left].v;
  const v1 = data[right].v;

  if (t1 === t0) {
    return { value: v0, yPx: yScale ? yScale(v0) : undefined, exact: true };
  }

  const factor = (normTarget - t0) / (t1 - t0);
  const interpolated = v0 + (v1 - v0) * factor;

  return { value: interpolated, yPx: yScale ? yScale(interpolated) : undefined, exact: false };
}

/**
 * Находит ближайшую реальную точку из массива данных
 */
export function findClosestPoint(data: ChartPoint[], targetTime: number): ChartPoint | null {
  if (!data || data.length === 0) return null;
  if (data.length === 1) return data[0];

  const normTarget = normalizeTime(targetTime);
  let low = 0;
  let high = data.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = normalizeTime(data[mid].t);
    if (midTime === normTarget) return data[mid];
    if (midTime < normTarget) low = mid + 1;
    else high = mid - 1;
  }

  const left = Math.max(0, high);
  const right = Math.min(data.length - 1, low);

  const distLeft = Math.abs(normalizeTime(data[left].t) - normTarget);
  const distRight = Math.abs(normalizeTime(data[right].t) - normTarget);

  return distLeft <= distRight ? data[left] : data[right];
}
