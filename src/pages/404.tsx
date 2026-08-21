import { useState, useMemo } from 'react';
import TimeChart from '../components/TimeChart';
import type { ChartSeries, HoverInfo } from '../components/TimeChart';

export default function Page404() {
  const [smooth, setSmooth] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  const [dimAfterCursor, setDimAfterCursor] = useState(true);
  const [tooltipLayout, setTooltipLayout] = useState<'column' | 'row'>('row');
  const [externalHoverData, setExternalHoverData] = useState<HoverInfo | null>(null);

  // 1. Мок-данные кандидатов / мульти-линии с близкими значениями (по скриншоту)
  const candidateSeries: ChartSeries[] = useMemo(() => {
    const now = Date.now();
    const baseTime = now - 50 * 60 * 1000;
    const pointsCount = 50;

    const aocData = [];
    const newsomData = [];
    const ossoffData = [];
    const harrisData = [];

    for (let i = 0; i <= pointsCount; i++) {
      const time = baseTime + i * 60 * 1000;
      const progress = i / pointsCount;

      // Сближение к концу графика (17.8%, 17.8%, 15.8%, 7.4%)
      const aoc = 15 + progress * 2.8 + Math.sin(i / 3) * 0.4;
      const newsom = 14 + progress * 3.8 + Math.cos(i / 3) * 0.3;
      const ossoff = 11 + progress * 4.8 + Math.sin(i / 2) * 0.6;
      const harris = 8 - progress * 0.6 + Math.cos(i / 4) * 0.5;

      aocData.push({ time, value: Math.round(aoc * 10) / 10 });
      newsomData.push({ time, value: Math.round(newsom * 10) / 10 });
      ossoffData.push({ time, value: Math.round(ossoff * 10) / 10 });
      harrisData.push({ time, value: Math.round(harris * 10) / 10 });
    }

    return [
      {
        id: 'aoc',
        name: 'Александрия Окасио-Кортез',
        color: '#3b82f6', // Синий
        data: aocData,
        strokeWidth: 2,
      },
      {
        id: 'newsom',
        name: 'Гавин Ньюсом',
        color: '#60a5fa', // Голубой
        data: newsomData,
        strokeWidth: 2,
      },
      {
        id: 'ossoff',
        name: 'Джон Оссофф',
        color: '#f59e0b', // Желтый
        data: ossoffData,
        strokeWidth: 2,
      },
      {
        id: 'harris',
        name: 'Камала Харрис',
        color: '#f97316', // Оранжевый
        data: harrisData,
        strokeWidth: 2,
      },
    ];
  }, []);

  // 2. Мок-данные матча (Team Spirit vs TEAM VISION)
  const matchSeries: ChartSeries[] = useMemo(() => {
    const now = Date.now();
    const baseTime = now - 40 * 60 * 1000;
    const pointsCount = 40;

    const visionData = [];
    const spiritData = [];

    for (let i = 0; i <= pointsCount; i++) {
      const time = baseTime + i * 60 * 1000;
      let valVision = 35;

      if (i <= 8) {
        valVision = 35 + Math.sin(i / 2) * 2;
      } else if (i <= 18) {
        const progress = (i - 8) / 10;
        valVision = 35 + progress * 25;
      } else if (i <= 26) {
        valVision = 60 + Math.sin((i - 18) / 2) * 3;
      } else if (i <= 32) {
        valVision = 52 + Math.cos((i - 26) / 1.5) * 4;
      } else {
        const progress = (i - 32) / 8;
        valVision = 55 + progress * 9;
      }

      const valSpirit = 100 - valVision;

      visionData.push({ time, value: Math.round(valVision * 10) / 10 });
      spiritData.push({ time, value: Math.round(valSpirit * 10) / 10 });
    }

    return [
      {
        id: 'team-vision',
        name: 'TEAM VISION',
        color: '#00f5d4',
        data: visionData,
        strokeWidth: 2.5,
      },
      {
        id: 'team-spirit',
        name: 'Team Spirit',
        color: '#717682',
        data: spiritData,
        strokeWidth: 2,
      },
    ];
  }, []);

  // 2. Мок-данные баланса (одиночная линия с градиентом и резким скачком 100 -> 10000)
  const balanceSeries: ChartSeries[] = useMemo(() => {
    const now = Date.now();
    const baseTime = now - 60 * 60 * 1000;
    const data = [];

    for (let i = 0; i <= 60; i++) {
      const time = baseTime + i * 60 * 1000;
      let val = 80 + Math.sin(i / 5) * 15;
      if (i > 45) {
        // Резкий всплеск баланса
        val = 100 + (i - 45) * 600;
      }
      data.push({ time, value: Math.round(val) });
    }

    return [
      {
        id: 'balance',
        name: 'Баланс',
        color: '#f59e0b',
        gradient: true,
        data,
      },
    ];
  }, []);

  return (
    <div className="container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>🎨 Демо графиков (TimeChart)</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          Кастомный SVG-компонент для визуализации временных рядов без раздутия бандла.
        </p>

        {/* Контролы для интерактивного тестирования */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={smooth}
              onChange={(e) => setSmooth(e.target.checked)}
            />
            Сглаживание (Smooth)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={showYAxis}
              onChange={(e) => setShowYAxis(e.target.checked)}
            />
            Ось Y и сетка (Show Y Axis)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={dimAfterCursor}
              onChange={(e) => setDimAfterCursor(e.target.checked)}
            />
            Приглушать правую часть (Dim After Cursor)
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginLeft: 'auto' }}>
            <span>Вид тултипа:</span>
            <button
              onClick={() => setTooltipLayout('row')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: tooltipLayout === 'row' ? 'var(--color-primary)' : 'transparent',
                color: tooltipLayout === 'row' ? 'var(--color-chart-bg)' : 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              В строку (Row)
            </button>
            <button
              onClick={() => setTooltipLayout('column')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: tooltipLayout === 'column' ? 'var(--color-primary)' : 'transparent',
                color: tooltipLayout === 'column' ? 'var(--color-chart-bg)' : 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              В колонку (Column)
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Кейс 0: Мульти-линии кандидатов с близкими значениями (по новому скриншоту) */}
        <div style={{ background: 'var(--color-chart-bg, #121418)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Кейс 1: Рейтинг кандидатов (4 линии, защита от наложения бейджей)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary, rgba(255, 255, 255, 0.5))' }}>
              4 близкие линии (17.8%, 17.8%, 15.8%, 7.4%), бейджи автоматически выстраиваются стопкой друг под другом.
            </span>
          </div>

          <TimeChart
            series={candidateSeries}
            height={280}
            smooth={smooth}
            showYAxis={showYAxis}
            dimAfterCursor={dimAfterCursor}
            tooltipLayout={tooltipLayout}
            lastPoint={true}
            timeStep="10m"
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        {/* Кейс 1: Дизайн матча */}
        <div style={{ background: 'var(--color-chart-bg, #121418)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Кейс 2: Вероятность победы команд (Team Spirit vs TEAM VISION)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary, rgba(255, 255, 255, 0.5))' }}>
              2 линии с пересечениями, авто-шаг времени, пульсирующие live-точки на концах.
            </span>
          </div>

          <TimeChart
            series={matchSeries}
            height={260}
            smooth={smooth}
            showYAxis={showYAxis}
            dimAfterCursor={dimAfterCursor}
            tooltipLayout={tooltipLayout}
            lastPoint={true}
            timeStep="10m"
            formatValue={(v) => `${Math.round(v)}%`}
          />
        </div>

        {/* Кейс 2: Баланс с градиентом и авто-масштабированием Y */}
        <div style={{ background: 'var(--color-chart-bg, #121418)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Кейс 3: Баланс с градиентом (Area Gradient & Nice Ticks)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary, rgba(255, 255, 255, 0.5))' }}>
              1 линия с заливкой, авто-подбор круглых чисел при резком скачке от 100 до 10 000.
            </span>
          </div>

          <TimeChart
            series={balanceSeries}
            height={240}
            smooth={smooth}
            showYAxis={showYAxis}
            dimAfterCursor={dimAfterCursor}
            tooltipLayout={tooltipLayout}
            formatValue={(v) => `$${v.toLocaleString()}`}
          />
        </div>

        {/* Кейс 3: Передача hover наружу (showInternalTooltip: false) */}
        <div style={{ background: 'var(--color-chart-bg, #121418)', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Кейс 4: Внешний Header со значениями (Требование 5)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary, rgba(255, 255, 255, 0.5))' }}>
              Внутренний тултип отключен (`showInternalTooltip=false`), данные при hover отправляются в верхнюю плашку.
            </span>
          </div>

          {/* Внешний компонент / плашка */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-card, rgba(255,255,255,0.04))',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid var(--color-border, rgba(255,255,255,0.06))'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--color-primary, rgba(255,255,255,0.7))' }}>
              Время: <b>{externalHoverData ? externalHoverData.formattedTime : 'Наведите на график'}</b>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {matchSeries.map((s) => {
                const pt = externalHoverData?.points.find((p) => p.seriesId === s.id);
                const currentVal = pt ? `${Math.round(pt.value)}%` : `${Math.round(s.data[s.data.length - 1].value)}%`;
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                    <span style={{ fontSize: '13px', color: s.color, fontWeight: 600 }}>{s.name}:</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary, #fff)' }}>{currentVal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <TimeChart
            series={matchSeries}
            height={240}
            smooth={smooth}
            showYAxis={showYAxis}
            dimAfterCursor={dimAfterCursor}
            showInternalTooltip={false}
            onHover={setExternalHoverData}
            formatValue={(v) => `${Math.round(v)}%`}
          />
        </div>
      </div>
    </div>
  );
}
