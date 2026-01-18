import style from './title.module.scss'
import { config } from '../../../config/config'
import IconSprite from '../../../elements/icon/Icon'

interface BetTitleProps {
  icon?: string
  title: string
  date: string
}

export default function BetTitle({ icon, title, date }: BetTitleProps) {
  if (icon === undefined) return <Title title={title} date={date} />
  return (
    <div className='row gap8'>
      <img className={style.icon} src={icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt={title} />
      <Title title={title} date={date} />
    </div>
  )
}

function Title({ title, date }: { title: string; date: string }) {
  return (
    <div className='column gap4'>
      <h3>{title}</h3>
      <div className={style.date}>
        <IconSprite name='finish' size={16} />
        <span>Завершение: {new Date(date).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
