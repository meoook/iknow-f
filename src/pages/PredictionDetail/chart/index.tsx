import s from './chart.module.scss';
import React, { useMemo, useState } from 'react';
import { TPredictionState } from '../../../types/app.types';
import type { IPredictionDetail } from '../../../types/app.types';
import type { ChartSeries, ChartPoint } from '../../../components/TimeChart';
import { useGetPredictionHistoryQuery } from '../../../services/api';
import TimeChart from '../../../components/TimeChart';
import Empty from '../../../elements/empty';
import logo from '../../../assets/ivanga.png';

const COLOR_PALETTE = [
  '#3b82f6', // Синий
  '#f59e0b', // Желтый / Янтарный
  '#ec4899', // Розовый
  '#a855f7', // Фиолетовый
  '#10b981', // Зеленый
  '#f97316', // Оранжевый
  '#00f5d4', // Бирюзовый
];

type TimePeriod = '6h' | '1d' | '1w' | '1m' | 'all';

const PERIOD_LABELS: { key: TimePeriod; label: string }[] = [
  { key: '6h', label: '6Ч' },
  { key: '1d', label: '1Д' },
  { key: '1w', label: '1Н' },
  { key: '1m', label: '1М' },
  { key: 'all', label: 'ВСЕ' },
];

interface PredictionChartProps {
  prediction: IPredictionDetail;
  soloLineGradient?: boolean;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  prediction,
  soloLineGradient = false,
}) => {
  const [period, setPeriod] = useState<TimePeriod>('all');
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());

  // Запрос истории с бэкенда
  const {
    data: historyResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPredictionHistoryQuery(
    { id: prediction.id, period },
    { skip: !prediction?.id }
  );

  // Выбираем топ-5 choices по объему/проценту, если их больше 5
  const topChoices = useMemo(() => {
    const rawChoices = prediction?.choices || [];
    if (rawChoices.length <= 5) return rawChoices;

    return [...rawChoices]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5);
  }, [prediction?.choices]);

  // Расчет актуальных текущих процентов из prediction в реальном времени
  const currentValues = useMemo(() => {
    if (!prediction || topChoices.length === 0) return {};
    const totalVolume = prediction.volume || 0;
    const values: Record<string, number> = {};
    topChoices.forEach((c) => {
      const pct = totalVolume > 0 ? ((c.volume || 0) / totalVolume) * 100 : 100 / topChoices.length;
      values[String(c.id)] = Math.round(pct * 10) / 10;
    });
    return values;
  }, [prediction, topChoices]);

  // Переключение видимости линии при клике в легенде
  const toggleChoice = (id: number) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      // Оставляем хотя бы одну активную линию на графике
      else if (next.size < topChoices.length - 1) next.add(id);
      return next;
    });
  };

  // Формирование серий данных: только активные (не скрытые) линии
  const series: ChartSeries[] = useMemo(() => {
    if (!prediction || topChoices.length === 0 || !historyResponse || historyResponse.length === 0) {
      return [];
    }

    // Добавляем хвост (текущий или bet_date)
    const toAdd =
      prediction.state === TPredictionState.ACTIVE ?
        { t: Date.now(), v: currentValues } :
        { t: new Date(prediction.bet_date).getTime(), v: currentValues };
    const points = [...historyResponse, toAdd];
    const activeChoices = topChoices.filter((choice) => !hiddenIds.has(choice.id));

    return activeChoices.map((choice) => {
      const originalIdx = topChoices.findIndex((c) => c.id === choice.id);
      const color = COLOR_PALETTE[originalIdx % COLOR_PALETTE.length];

      const data: ChartPoint[] = points.map((pt) => ({
        t: pt.t,
        v: pt.v[String(choice.id)] ?? 0,
      }));

      return {
        id: String(choice.id),
        name: choice.title,
        color,
        data,
        strokeWidth: 2,
        gradient: soloLineGradient ? activeChoices.length === 1 : false,
      };
    });
  }, [prediction, topChoices, historyResponse, currentValues, hiddenIds, soloLineGradient]);

  if (!prediction || topChoices.length === 0) return null;

  const totalVolume = prediction.volume || 0;
  const hasHistory = historyResponse && historyResponse.length > 0;

  return (
    <div className='column pv-2'>

      {/* Интерактивная легенда (отображается при наличии данных) */}
      <div className='row justify end'>
        {hasHistory && (
          <div className={s.legend}>
            {topChoices.map((choice, idx) => {
              const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
              const isHidden = hiddenIds.has(choice.id);
              const percent = totalVolume > 0 ? ((choice.volume || 0) / totalVolume) * 100 : 100 / topChoices.length;

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`${s.legendItem} ${isHidden ? s.dimmed : ''}`}
                  style={{ color }}
                  onClick={() => toggleChoice(choice.id)}
                  title={isHidden ? 'Показать линию на графике' : 'Скрыть линию с графика'}
                >
                  <span className={s.dot} />
                  <span className={s.legendTitle}>{choice.title}</span>
                  <span className={s.percent}>{percent.toFixed(1)}%</span>
                </button>
              );
            })}
          </div>
        )}
        <img className={s.logo} src={logo} alt="logo" />
      </div>

      {/* График / Загрузка / Заглушка ошибки */}
      <div className={s.chartWrapper}>
        {isLoading ? (
          <div className={s.stateWrapper}>
            <Empty loading title="Загрузка графика..." />
          </div>
        ) : isError || !hasHistory ? (
          <div className={s.stateWrapper}>
            <Empty title="История графика временно недоступна" icon="draft" />
            <button type="button" className={s.retry} onClick={() => refetch()}>
              Обновить
            </button>
          </div>
        ) : (
          <TimeChart
            series={series}
            height={240}
            smooth={true}
            showYAxis={true}
            yMin={0}
            yMax={100}
            dimAfterCursor={true}
            tooltipLayout="row"
            lastPoint={true}
            timeStep="auto"
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Тулбар с кнопками периодов */}
      <div className='row center justify text-sm pt-2'>
        <div>${(prediction.volume || 0).toLocaleString()} Объем</div>
        <div className={s.toolbar}>
          {PERIOD_LABELS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`${s.periodBtn} ${period === p.key ? s.active : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PredictionChart;
