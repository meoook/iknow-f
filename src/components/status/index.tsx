import style from './status.module.scss'
import IconSprite from '../../elements/icon/Icon'

interface PredictionStatusProps {
  group: string
  state: string
  date: string
  closed?: string
  created?: string
}

export default function PredictionStatus({ group, state, date, closed, created }: PredictionStatusProps) {
  return (
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
  )
}
