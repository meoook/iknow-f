import s from './panel.module.scss'
import type { IChoice, IPredictionDetail } from '../../../types/app.types'
import TradeContent from './TradeContent'
import { Link } from 'react-router-dom'
import IconSprite from '../../../elements/icon'

interface TradePanelProps {
  prediction: IPredictionDetail
  selectedChoice: IChoice | null
}

export default function TradePanel({ prediction, selectedChoice }: TradePanelProps) {
  return (
    <aside className={`${s.panel} md-hide w-full`}>
      {['DISPUTE', 'ENDED'].includes(prediction.state) ? (
        <TradePanelClosed prediction={prediction} />
      ) : (
        <TradeContent prediction={prediction} selectedChoice={selectedChoice} />
      )}
      <TOS />
    </aside>
  )
}

const TradePanelClosed = ({ prediction }: { prediction: IPredictionDetail }) => {
  const winChoice = prediction.choices.find((choice) => choice.win)
  return (
    <div className={s.bet}>
      <div className={s.win}>
        <IconSprite name='crown' size={48} color='var(--color-brand)' />
        <h3 className='clamp-3'>{winChoice?.title || 'Победитель не определен'}</h3>
        <h3 className='color-blue'>${new Intl.NumberFormat('en-US').format(prediction.volume)}</h3>
      </div>
    </div>
  )
}

const TOS = () => {
  return (
    <div className='column center pv-3 secondary text-sm'>
      <div>Делая ставку, вы соглашаетесь с</div>
      <Link className='underline h-brand' to='/tos'>
        условиями использования
      </Link>
    </div>
  )
}
