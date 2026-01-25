import style from './head.module.scss'
import { config } from '../../config/config'

interface PredictionHeadProps {
  icon?: string
  title: string
  big?: boolean
  progress?: number
}

export default function PredictionHead({ icon, title, big, progress }: PredictionHeadProps) {
  const MIN_SCALE = 0.8
  const scale = Math.max(MIN_SCALE, 1 - 0.9 * (progress || 0))
  return (
    <div className={style.head}>
      <div className='row center gap12' style={{ transform: `scale(${scale})` }}>
        <img src={icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt={title} />
        {big ? <h1>{title}</h1> : <h3>{title}</h3>}
      </div>
      <div className={style.hr} style={{ opacity: progress || 0 }} />
    </div>
  )
}
