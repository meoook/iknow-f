import style from './page.module.scss'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import IconSprite from '../../elements/icon'
import { useModalContext } from '../../services/ModalContext'
import ModalDeposit from '../../modals/deposit'

export default function PageUser() {
  const { id } = useParams<{ id: string }>()
  const { openModal } = useModalContext()

  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions')
  const [showBalance, setShowBalance] = useState(true)
  const [pnlRange, setPnlRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W')

  const mockData = {
    portfolio: 0.0,
    availableUnits: 0.0,
    pnl: 0.0,
    pnlPercent: 0,
    pnlTime: 'за последнюю неделю',
  }

  return (
    <div className={style.wrapper}>
      <div className={style.topGrid}>
        {/* Portfolio Card */}
        <div className={style.card}>
          <div className={style.cardHeader}>
            <div className={style.title}>
              Портфель <IconSprite name='info' size={16} color='var(--color-secondary)' />
            </div>
            <div className={style.available}>
              Доступно для торговли
              <span>${mockData.availableUnits.toFixed(2)}</span>
            </div>
          </div>

          <div className={style.balanceRow}>
            <h1 className={style.balance}>${showBalance ? mockData.portfolio.toFixed(2) : '****'}</h1>
            <button className={style.iconBtn} onClick={() => setShowBalance(!showBalance)}>
              <IconSprite name='info' size={20} color='var(--color-secondary)' />
            </button>
          </div>
          <div className={style.subText}>$0.00 (0%) за день</div>

          <div className={style.actions}>
            <button className={style.btnDeposit} onClick={() => openModal(ModalDeposit)}>
              <IconSprite name='upload' size={18} />
              Депозит
            </button>
            <button className={style.btnWithdraw}>
              <IconSprite name='exit' size={18} />
              Вывод
            </button>
          </div>
        </div>

        {/* PnL Card */}
        <div className={style.card}>
          <div className={style.cardHeader}>
            <div className={style.title}>
              <IconSprite name='trend' size={16} color='var(--color-secondary)' /> Прибыль/убыток
            </div>
            <div className={style.ranges}>
              {(['1D', '1W', '1M', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  className={`btn blue-l${pnlRange === range ? ' active' : ''}`}
                  onClick={() => setPnlRange(range)}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className={style.balanceRow}>
            <h1 className={style.balance}>${mockData.pnl.toFixed(2).replace('.', ',')}</h1>
            <button className={style.iconBtn}>
              <IconSprite name='upload' size={20} color='var(--color-secondary)' />
            </button>
          </div>
          <div className={style.subText}>За последнюю неделю</div>

          <div className={style.chartPlaceholder}>
            <div className={style.chartLine}></div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className={style.contentSection}>
        <div className={style.tabs}>
          <button
            className={`${style.tab} ${activeTab === 'positions' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('positions')}>
            Позиции
          </button>
          <button
            className={`${style.tab} ${activeTab === 'orders' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('orders')}>
            Открытые заявки
          </button>
          <button
            className={`${style.tab} ${activeTab === 'history' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('history')}>
            История
          </button>
        </div>

        <div className={style.tableControls}>
          <div className={style.searchWrapper}>
            <IconSprite name='search' size={18} color='var(--color-secondary)' />
            <input type='text' placeholder='Поиск' />
          </div>
          <button className={style.sortBtn}>
            <IconSprite name='filter' size={18} />
            Текущая стоимость
          </button>
        </div>

        <div className={style.tableHeader}>
          <div className={style.col}>
            РЫНОК <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СРЕДН. → СЕЙЧАС <IconSprite name='info' size={12} /> <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СТАВКА <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            ВЫИГРЫШ <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СТОИМОСТЬ <IconSprite name='diff' size={12} />
          </div>
        </div>

        <div className={style.emptyState}>Позиции не обнаружены.</div>
        <div className={style.emptyState}>{id}</div>
      </div>
    </div>
  )
}
