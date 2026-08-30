import s from './panel.module.scss'
import { Link } from 'react-router-dom'
import { TPredictionState, type IChoice, type IPredictionDetail } from '../../../types/app.types'
import IconSprite from '../../../elements/icon'
import TradeContent from './TradeContent'

interface TradePanelProps {
  prediction: IPredictionDetail
  selectedChoice: IChoice | null
}

export default function TradePanel({ prediction, selectedChoice }: TradePanelProps) {
  return (
    <aside className={`${s.panel} md-hide w-full`}>
      <div className='bg-dialog shadow p-4 bd bdr-12'>
        {prediction.state !== TPredictionState.ACTIVE ? (
          <TradePanelInactive prediction={prediction} />
        ) : (
          <TradeContent prediction={prediction} selectedChoice={selectedChoice} />
        )}
      </div>
      <TOS />
    </aside>
  )
}

const TradePanelInactive = ({ prediction }: { prediction: IPredictionDetail }) => {
  const winChoice = prediction.choices.find((choice) => choice.win)
  return (
    <div className={s.bet}>
      <div className='column center gap-5 text-center pv-4'>
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
