import style from './bet.module.scss'
import type { IBet } from '../../types/app.types'
import { config } from '../../config/config'

interface ToggleProps {
  bet: IBet
}

export default function BetItem({ bet }: ToggleProps) {
  return (
    <div className={style.bet}>
      <div className='row center gap8'>
        <img src={bet.choice.prediction_icon || `${config.imgBaseUrl}/icon/no_icon1.png`} alt={bet.choice.prediction_title} />
        <h3>{bet.choice.prediction_title}</h3>
      </div>
      <h3>{bet.choice.title}</h3>
      <p>{bet.choice.prediction_group}</p>
      <p>{new Date(bet.choice.prediction_end_date).toLocaleDateString()}</p>
      <p>{bet.choice.result}</p>
      <p>{bet.choice.volume_y}</p>
      <p>{bet.choice.volume_n}</p>
      <p>{bet.choice.bet_diff}</p>
      <p>{bet.choice.id}</p>
      <p>{bet.state}</p>
      <p>{new Date(bet.created).toLocaleDateString()}</p>
      <div className='column gap4'>
        <div>{bet.vote ? 'Сбудется' : 'Не сбудется'}</div>
        <div>{bet.currency}</div>
        <div className='row center'>{bet.amount}</div>
      </div>
    </div>
  )
}

