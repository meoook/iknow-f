import style from './status.module.scss'
import IconSprite from '../../elements/icon/Icon'

interface PredictionStatusProps {
  tags?: string[]
  state: string
  date: string
  closed?: string
  created?: string
}

export default function PredictionStatus({ tags, state, date, closed, created }: PredictionStatusProps) {
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
      {tags && (
        <div className='row center gap4'>
          <div className='label'>Группы</div>
          {tags.map((tag) => (
            <div className='chip' key={tag}>
              {tag}
            </div>
          ))}
        </div>
      )}
      <div className='row center gap4'>
        <div className='label'>Статус</div>
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
