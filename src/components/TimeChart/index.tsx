import React, { useId, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line, area, curveMonotoneX, curveLinear } from 'd3-shape';
import type { TimeChartProps, HoverInfo, HoverPointInfo, ChartPoint } from './TimeChart.types';
import {
  normalizeTime,
  generateTimeTicks,
  defaultFormatTime,
  defaultFormatTooltipTime,
  interpolateValueAtTime,
} from './utils/timeUtils';
import styles from './TimeChart.module.scss';

export * from './TimeChart.types';

interface PositionedHoverPoint extends HoverPointInfo {
  adjustedY: number;
}

/**
 * Раздвигает бейджи по вертикали, предотвращая их наложение при близких значениях
 */
function resolveBadgeCollisions(
  points: HoverPointInfo[],
  minDistance: number,
  minY: number,
  maxY: number
): PositionedHoverPoint[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return [{ ...points[0], adjustedY: Math.max(minY, Math.min(maxY, points[0].yPx)) }];
  }

  // Сортируем по реальной Y-координате
  const sorted = [...points]
    .map((p) => ({ ...p, adjustedY: p.yPx }))
    .sort((a, b) => a.yPx - b.yPx);

  // 1. Проход сверху вниз: сдвигаем вниз перекрывающиеся
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.adjustedY - prev.adjustedY < minDistance) {
      curr.adjustedY = prev.adjustedY + minDistance;
    }
  }

  // 2. Проход снизу вверх: если стопка вылезла за нижний край
  if (sorted[sorted.length - 1].adjustedY > maxY) {
    sorted[sorted.length - 1].adjustedY = maxY;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const next = sorted[i + 1];
      const curr = sorted[i];
      if (next.adjustedY - curr.adjustedY < minDistance) {
        curr.adjustedY = next.adjustedY - minDistance;
      }
    }
  }

  // 3. Проход сверху вниз: если сдвиг вверх вытолкнул за верхний край
  if (sorted[0].adjustedY < minY) {
    sorted[0].adjustedY = minY;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.adjustedY - prev.adjustedY < minDistance) {
        curr.adjustedY = prev.adjustedY + minDistance;
      }
    }
  }

  return sorted;
}

export const TimeChart: React.FC<TimeChartProps> = ({
  series,
  height = 300,
  className = '',
  smooth = true,
  lastPoint = false,
  timeStep = 'auto',
  formatTime,
  formatTooltipTime = defaultFormatTooltipTime,
  showYAxis = true,
  yMin: explicitYMin,
  yMax: explicitYMax,
  yPaddingRatio = 0.08,
  yTicksCount = 5,
  formatValue = (v) => `${Math.round(v)}%`,
  showInternalTooltip = true,
  showCrosshair = true,
  dimAfterCursor = false,
  tooltipLayout = 'column',
  onHover,
  margins: customMargins,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const chartUid = useId();

  // Отслеживание ширины контейнера
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(rect.width);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Отступы графика
  const margins = useMemo(() => {
    return {
      top: customMargins?.top ?? 30,
      right: customMargins?.right ?? (showYAxis ? 48 : 16),
      bottom: customMargins?.bottom ?? 28,
      left: customMargins?.left ?? 16,
    };
  }, [customMargins, showYAxis]);

  const innerWidth = Math.max(0, containerWidth - margins.left - margins.right);
  const innerHeight = Math.max(0, height - margins.top - margins.bottom);

  // Вычисление диапазона времени (X)
  const timeDomain = useMemo(() => {
    let minT = Infinity;
    let maxT = -Infinity;

    for (const s of series) {
      if (!s.data || s.data.length === 0) continue;
      const firstT = normalizeTime(s.data[0].time);
      const lastT = normalizeTime(s.data[s.data.length - 1].time);
      if (firstT < minT) minT = firstT;
      if (lastT > maxT) maxT = lastT;
    }

    if (minT === Infinity || maxT === -Infinity) {
      const now = Date.now();
      return [now - 3600 * 1000, now] as [number, number];
    }

    if (minT === maxT) {
      return [minT - 1000, maxT + 1000] as [number, number];
    }

    return [minT, maxT] as [number, number];
  }, [series]);

  // Вычисление диапазона значений (Y)
  const yDomain = useMemo(() => {
    let minV = Infinity;
    let maxV = -Infinity;

    for (const s of series) {
      if (!s.data) continue;
      for (const p of s.data) {
        if (p.value < minV) minV = p.value;
        if (p.value > maxV) maxV = p.value;
      }
    }

    if (minV === Infinity || maxV === -Infinity) {
      minV = 0;
      maxV = 100;
    }

    const calculatedMin = explicitYMin ?? minV;
    const calculatedMax = explicitYMax ?? maxV;

    if (calculatedMin === calculatedMax) {
      return [calculatedMin - 1, calculatedMax + 1] as [number, number];
    }

    // Если границы не заданы жестко, добавляем padding
    let finalMin = calculatedMin;
    let finalMax = calculatedMax;

    if (explicitYMin === undefined || explicitYMax === undefined) {
      const delta = calculatedMax - calculatedMin;
      const pad = delta * yPaddingRatio;
      if (explicitYMin === undefined) finalMin = calculatedMin - pad;
      if (explicitYMax === undefined) finalMax = calculatedMax + pad;
    }

    return [finalMin, finalMax] as [number, number];
  }, [series, explicitYMin, explicitYMax, yPaddingRatio]);

  // Шкалы X и Y
  const xScale = useMemo(() => {
    return scaleTime()
      .domain([new Date(timeDomain[0]), new Date(timeDomain[1])])
      .range([0, innerWidth]);
  }, [timeDomain, innerWidth]);

  const yScale = useMemo(() => {
    const scale = scaleLinear().domain(yDomain).range([innerHeight, 0]);
    // Применяем nice, если границы рассчитывались автоматически
    if (explicitYMin === undefined && explicitYMax === undefined) {
      return scale.nice(yTicksCount);
    }
    return scale;
  }, [yDomain, innerHeight, explicitYMin, explicitYMax, yTicksCount]);

  // Деления сетки по оси Y
  const yTicks = useMemo(() => {
    return yScale.ticks(yTicksCount);
  }, [yScale, yTicksCount]);

  // Деления сетки по оси X
  const xTicks = useMemo(() => {
    return generateTimeTicks(timeDomain[0], timeDomain[1], timeStep, 5);
  }, [timeDomain, timeStep]);

  // Генераторы SVG путей
  const seriesPaths = useMemo(() => {
    if (innerWidth <= 0 || innerHeight <= 0) return [];

    const curve = smooth ? curveMonotoneX : curveLinear;

    return series.map((s) => {
      const lineGenerator = line<ChartPoint>()
        .x((d) => xScale(new Date(normalizeTime(d.time))))
        .y((d) => yScale(d.value))
        .curve(curve);

      const areaGenerator = area<ChartPoint>()
        .x((d) => xScale(new Date(normalizeTime(d.time))))
        .y0(innerHeight)
        .y1((d) => yScale(d.value))
        .curve(curve);

      const linePath = lineGenerator(s.data) || '';
      const areaPath = s.gradient ? areaGenerator(s.data) || '' : null;

      // Последняя точка серии
      const lastItem = s.data && s.data.length > 0 ? s.data[s.data.length - 1] : null;
      const lastPointCoords = lastItem
        ? {
            x: xScale(new Date(normalizeTime(lastItem.time))),
            y: yScale(lastItem.value),
            value: lastItem.value,
          }
        : null;

      return {
        ...s,
        linePath,
        areaPath,
        lastPointCoords,
      };
    });
  }, [series, smooth, xScale, yScale, innerWidth, innerHeight]);

  // Обработка Hover
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      if (innerWidth <= 0 || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left - margins.left;
      const clampedX = Math.max(0, Math.min(innerWidth, clientX));

      const timeAtCursor = xScale.invert(clampedX).getTime();
      setHoveredTime(timeAtCursor);

      if (onHover) {
        const points: HoverPointInfo[] = [];

        for (const s of series) {
          const res = interpolateValueAtTime(s.data, timeAtCursor);
          if (res !== null) {
            points.push({
              seriesId: s.id,
              name: s.name,
              color: s.color,
              value: res.value,
              yPx: yScale(res.value),
            });
          }
        }

        const info: HoverInfo = {
          timestamp: timeAtCursor,
          formattedTime: formatTooltipTime(timeAtCursor),
          xPx: clampedX,
          points,
        };

        onHover(info);
      }
    },
    [innerWidth, margins.left, xScale, yScale, series, onHover, formatTooltipTime]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredTime(null);
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  // Вычисление данных для отображения hover элементов
  const activeHoverData = useMemo(() => {
    if (hoveredTime === null || innerWidth <= 0) return null;

    const xPx = xScale(new Date(hoveredTime));
    const points: Array<{
      seriesId: string;
      name: string;
      color: string;
      value: number;
      yPx: number;
    }> = [];

    for (const s of series) {
      const res = interpolateValueAtTime(s.data, hoveredTime);
      if (res !== null) {
        points.push({
          seriesId: s.id,
          name: s.name,
          color: s.color,
          value: res.value,
          yPx: yScale(res.value),
        });
      }
    }

    return {
      xPx,
      formattedTime: formatTooltipTime(hoveredTime),
      points,
    };
  }, [hoveredTime, innerWidth, xScale, yScale, series, formatTooltipTime]);

  const totalDuration = timeDomain[1] - timeDomain[0];

  return (
    <div
      ref={containerRef}
      className={`${styles.chartContainer} ${className}`}
      style={{ height }}
    >
      {containerWidth > 0 && (
        <svg
          viewBox={`0 0 ${containerWidth} ${height}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {series.map((s, idx) => {
              if (!s.gradient) return null;
              const gradId = `chart-grad-${chartUid}-${idx}`;
              return (
                <linearGradient
                  key={gradId}
                  id={gradId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
                  <stop offset="85%" stopColor={s.color} stopOpacity="0.04" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              );
            })}

            {/* Маски для разделения линии до и после курсора */}
            {activeHoverData && dimAfterCursor && (
              <>
                <clipPath id={`clip-left-${chartUid}`}>
                  <rect
                    x={0}
                    y={-10}
                    width={activeHoverData.xPx}
                    height={innerHeight + 20}
                  />
                </clipPath>
                <clipPath id={`clip-right-${chartUid}`}>
                  <rect
                    x={activeHoverData.xPx}
                    y={-10}
                    width={Math.max(0, innerWidth - activeHoverData.xPx)}
                    height={innerHeight + 20}
                  />
                </clipPath>
              </>
            )}
          </defs>

          {/* Смещение рабочей области с учетом margins */}
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {/* Прозрачный оверлей для надежного перехвата событий курсора по всей области */}
            <rect
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              className={styles.overlayRect}
            />

            {/* Горизонтальная сетка и метки оси Y */}
            {showYAxis && (
              <g className="grid-layer">
                {yTicks.map((tickVal) => {
                  const y = yScale(tickVal);
                  return (
                    <g key={tickVal}>
                      <line
                        x1={0}
                        y1={y}
                        x2={innerWidth}
                        y2={y}
                        className={styles.gridLine}
                      />
                      <text
                        x={innerWidth + 10}
                        y={y + 4}
                        className={`${styles.axisText} ${styles.yAxisText}`}
                      >
                        {formatValue(tickVal)}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Метки оси X */}
            <g className="x-axis-layer">
              {xTicks.map((t) => {
                const x = xScale(new Date(t));
                if (x < -10 || x > innerWidth + 10) return null;
                const label = formatTime
                  ? formatTime(t)
                  : defaultFormatTime(t, totalDuration);

                return (
                  <text
                    key={t}
                    x={x}
                    y={innerHeight + 20}
                    className={`${styles.axisText} ${styles.xAxisText}`}
                  >
                    {label}
                  </text>
                );
              })}
            </g>

            {/* Слои линий и градиентов */}
            {seriesPaths.map((s, idx) => {
              const gradId = `chart-grad-${chartUid}-${idx}`;
              const baseOpacity = s.dimmed ? 0.35 : 1;

              // Если включено приглушение правой части при hover
              if (activeHoverData && dimAfterCursor) {
                return (
                  <g key={s.id || idx}>
                    {/* Левая активная часть до курсора */}
                    <g clipPath={`url(#clip-left-${chartUid})`} opacity={baseOpacity}>
                      {s.gradient && s.areaPath && (
                        <path d={s.areaPath} fill={`url(#${gradId})`} />
                      )}
                      {s.linePath && (
                        <path
                          d={s.linePath}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={s.strokeWidth ?? 2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </g>

                    {/* Правая приглушенная часть после курсора */}
                    <g clipPath={`url(#clip-right-${chartUid})`} opacity={baseOpacity * 0.18}>
                      {s.gradient && s.areaPath && (
                        <path d={s.areaPath} fill={`url(#${gradId})`} />
                      )}
                      {s.linePath && (
                        <path
                          d={s.linePath}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={s.strokeWidth ?? 2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </g>
                  </g>
                );
              }

              return (
                <g key={s.id || idx} opacity={baseOpacity}>
                  {s.gradient && s.areaPath && (
                    <path d={s.areaPath} fill={`url(#${gradId})`} />
                  )}
                  {s.linePath && (
                    <path
                      d={s.linePath}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.strokeWidth ?? 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              );
            })}

            {/* Пульсирующая точка на конце линии (когда нет активного курсора) */}
            {hoveredTime === null &&
              lastPoint &&
              seriesPaths.map((s) => {
                if (!s.lastPointCoords) return null;
                const { x, y } = s.lastPointCoords;
                return (
                  <g key={`last-point-${s.id}`} className={styles.lastPointGroup}>
                    {/* Пульсирующий ореол */}
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={s.color}
                      className={styles.pulseRing}
                    />
                    {/* Центральная точка */}
                    <circle
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill={s.color}
                      className={styles.hoverDot}
                    />
                  </g>
                );
              })}

            {/* Интерактивный слой наведения в SVG (Crosshair и точки на линиях) */}
            {activeHoverData && (
              <g className="hover-layer">
                {/* Вертикальная направляющая линия */}
                {showCrosshair && (
                  <line
                    x1={activeHoverData.xPx}
                    y1={-12}
                    x2={activeHoverData.xPx}
                    y2={innerHeight}
                    className={styles.crosshairLine}
                  />
                )}

                {/* Точки на линиях при hover */}
                {activeHoverData.points.map((pt) => (
                  <circle
                    key={`dot-${pt.seriesId}`}
                    cx={activeHoverData.xPx}
                    cy={pt.yPx}
                    r="4.5"
                    fill={pt.color}
                    className={styles.hoverDot}
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
      )}

      {/* HTML Тултипы с нативным padding и flexbox поверх SVG */}
      {showInternalTooltip && activeHoverData && (() => {
        // Разворачиваем тултипы влево только в последней трети графика (после 65%)
        const isFlipped = activeHoverData.xPx > innerWidth * 0.65;
        const anchorX = margins.left + activeHoverData.xPx;

        return (
          <div className={styles.htmlTooltipOverlay}>
            {/* Время над вертикальной направляющей */}
            <div
              className={styles.tooltipTimeHeader}
              style={{
                left: `${anchorX}px`,
                top: `${margins.top}px`,
                transform: isFlipped
                  ? 'translate(calc(-100% - 6px), -20px)'
                  : 'translate(6px, -20px)',
              }}
            >
              {activeHoverData.formattedTime}
            </div>

            {/* Плашки точек с защитой от наложения (Collision Avoidance) */}
            {resolveBadgeCollisions(
              activeHoverData.points,
              tooltipLayout === 'row' ? 28 : 42,
              12,
              innerHeight - 12
            ).map((pt) => {
              const leftPx = isFlipped ? anchorX - 10 : anchorX + 10;
              const topPx = margins.top + pt.adjustedY;

              if (tooltipLayout === 'row') {
                return (
                  <div
                    key={`badge-${pt.seriesId}`}
                    className={`${styles.tooltipBadge} ${styles.tooltipBadgeRow}`}
                    style={{
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                      transform: isFlipped
                        ? 'translate(-100%, -50%)'
                        : 'translate(0, -50%)',
                    }}
                  >
                    <span
                      className={styles.colorPill}
                      style={{ backgroundColor: pt.color }}
                    />
                    <span className={styles.tooltipName}>{pt.name}</span>
                    <span
                      className={styles.tooltipValue}
                      style={{ color: pt.color }}
                    >
                      {formatValue(pt.value)}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`badge-${pt.seriesId}`}
                  className={`${styles.tooltipBadge} ${styles.tooltipBadgeColumn}`}
                  style={{
                    left: `${leftPx}px`,
                    top: `${topPx}px`,
                    transform: isFlipped
                      ? 'translate(-100%, -50%)'
                      : 'translate(0, -50%)',
                    color: pt.color,
                  }}
                >
                  <span className={styles.tooltipName}>{pt.name}</span>
                  <span className={styles.tooltipValue}>{formatValue(pt.value)}</span>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default TimeChart;
