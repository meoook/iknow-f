import style from './head.module.scss'
import { config } from '../../config/config'
import IconSprite from '../../elements/icon/Icon'

interface PredictionHeadProps {
  icon?: string
  title: string
  group: string
  state: string
  date: string
  closed?: string
  created?: string
  big?: boolean
}

export default function PredictionHead({ icon, title, group, state, date, closed, created, big }: PredictionHeadProps) {
  return (
    <div className={style.head}>
      <div className='row center gap12'>
        <img src={icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt={title} />
        {big ? <h1>{title}</h1> : <h3>{title}</h3>}
      </div>
      <div className='row center gap12'>
        <div className={style.date}>
          <IconSprite name='finish' size={16} />
          {closed ? (
            <span>Завершено: {new Date(closed).toLocaleDateString()}</span>
          ) : (
            <span>Завершение: {new Date(date).toLocaleDateString()}</span>
          )}
        </div>
        <div className='row center gap4'>
          <span className='label'>Группа</span>
          <span>{group}</span>
        </div>
        <div className='row center gap4'>
          <span className='label'>Статус</span>
          <span>{state}</span>
        </div>
        {created && (
          <div className='row center gap4'>
            <span className='label'>Создано</span>
            <span>{new Date(created).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
