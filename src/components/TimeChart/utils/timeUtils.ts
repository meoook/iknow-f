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
 * Бинарный поиск и интерполяция значения для заданного времени с поддержкой монотонного кубического сплайна (D3 curveMonotoneX)
 */
export function interpolateValueAtTime(
  data: ChartPoint[],
  targetTime: number,
  smooth = false
): { value: number; exact: boolean } | null {
  if (!data || data.length === 0) return null;

  if (data.length === 1) {
    return { value: data[0].value, exact: true };
  }

  const normTarget = normalizeTime(targetTime);
  const firstTime = normalizeTime(data[0].time);
  const lastTime = normalizeTime(data[data.length - 1].time);

  if (normTarget <= firstTime) {
    return { value: data[0].value, exact: normTarget === firstTime };
  }
  if (normTarget >= lastTime) {
    return { value: data[data.length - 1].value, exact: normTarget === lastTime };
  }

  // Бинарный поиск отрезка [left, right]
  let low = 0;
  let high = data.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = normalizeTime(data[mid].time);

    if (midTime === normTarget) {
      return { value: data[mid].value, exact: true };
    } else if (midTime < normTarget) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const left = Math.max(0, high);
  const right = Math.min(data.length - 1, low);

  const t0 = normalizeTime(data[left].time);
  const t1 = normalizeTime(data[right].time);
  const v0 = data[left].value;
  const v1 = data[right].value;

  if (t1 === t0) return { value: v0, exact: true };

  // Если сглаживание включено и точек больше 2, используем монотонный кубический сплайн (аналог curveMonotoneX)
  if (smooth && data.length > 2) {
    const n = data.length;
    const x = (idx: number) => normalizeTime(data[idx].time);
    const y = (idx: number) => data[idx].value;

    const deltas: number[] = new Array(n - 1);
    for (let k = 0; k < n - 1; k++) {
      const dx = x(k + 1) - x(k);
      deltas[k] = dx === 0 ? 0 : (y(k + 1) - y(k)) / dx;
    }

    const tangents: number[] = new Array(n);
    tangents[0] = deltas[0];
    tangents[n - 1] = deltas[n - 2];

    for (let k = 1; k < n - 1; k++) {
      if (deltas[k - 1] * deltas[k] <= 0) {
        tangents[k] = 0;
      } else {
        const dxPrev = x(k) - x(k - 1);
        const dxNext = x(k + 1) - x(k);
        const dxTotal = dxPrev + dxNext;
        tangents[k] = (3 * dxTotal) / ((dxTotal + dxNext) / deltas[k - 1] + (dxTotal + dxPrev) / deltas[k]);
      }
    }

    const h = t1 - t0;
    const m0 = tangents[left];
    const m1 = tangents[right];

    const t = (normTarget - t0) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const interpolated = h00 * v0 + h10 * h * m0 + h01 * v1 + h11 * h * m1;
    return { value: interpolated, exact: false };
  }

  // Линейная интерполяция между двумя соседними точками
  const factor = (normTarget - t0) / (t1 - t0);
  const interpolated = v0 + (v1 - v0) * factor;

  return { value: interpolated, exact: false };
}
