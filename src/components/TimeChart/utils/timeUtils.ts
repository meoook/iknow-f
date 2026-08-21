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
 * Стандартное форматирование метки времени на оси X
 */
export function defaultFormatTime(timestamp: number, totalDurationMs?: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Если диапазон меньше суток — показываем часы:минуты
  if (!totalDurationMs || totalDurationMs <= 24 * 60 * 60 * 1000) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Если больше суток — показываем дату и месяц
  const day = date.getDate();
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const month = monthNames[date.getMonth()];

  if (!isSameDay && totalDurationMs > 30 * 24 * 60 * 60 * 1000) {
    return `${day} ${month}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
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
 * Бинарный поиск ближайшей точки или интерполяция значения для заданного времени
 */
export function interpolateValueAtTime(data: ChartPoint[], targetTime: number): { value: number; exact: boolean } | null {
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

  // Линейная интерполяция между двумя соседними точками
  const factor = (normTarget - t0) / (t1 - t0);
  const interpolated = v0 + (v1 - v0) * factor;

  return { value: interpolated, exact: false };
}
