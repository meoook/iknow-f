import style from './progress.module.scss'
import { intlNumber } from '../../hooks/hooks'

interface ProgressProps {
  total: number
  volume: number
}

export default function Progress({ total, volume }: ProgressProps) {
  const volumeString = intlNumber('ru-RU', volume)
  const percent = (volume / total) * 100
  const color = percent > 80 ? 'red' : percent > 50 ? 'orange' : 'green'

  return (
    <div className={style.progress}>
      <div className={`${style.bar} ${color}`} style={{ width: percent.toFixed(2) + '%' }}>
        &nbsp;
      </div>
      <span>
        {volumeString} ({percent.toFixed(2) || 0}%)
      </span>
    </div>
  )
}
