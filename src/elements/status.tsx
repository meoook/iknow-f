import IconSprite from './icon'

interface PredictionStatusProps {
  state: string
  date: string
  volume?: number
  closed: string | null
  created?: number
  bet_end?: string
  link?: string
}

export default function PredictionStatus({
  state,
  date,
  closed,
  created,
  volume,
  bet_end,
  link,
}: PredictionStatusProps) {
  return (
    <>
      <div className='row center gap-3 lh-1'>
        <div className='flex-i center gap-1 text-sm color-brand nowrap'>
          <IconSprite name='finish' size={16} />
          {closed ? (
            <span>Завершено: {new Date(closed).toLocaleDateString()}</span>
          ) : (
            <span>Завершение: {new Date(date).toLocaleDateString()}</span>
          )}
        </div>
        <div className='flex-i center gap-1 lg-hide'>
          <div className='label'>Статус</div>
          <span className='text-xs'>{state}</span>
        </div>
        {created && (
          <div className='flex-i center gap-1'>
            <span className='label'>Создано</span>
            <span className='text-xs'>{new Date(created).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className='row center gap-3 lh-1'>
        {volume && (
          <div className='flex-i center gap-1'>
            <div className='secondary'>Объем</div>
            <span>${new Intl.NumberFormat('en-US').format(volume)}</span>
          </div>
        )}
        <div className='hide lg-flex center gap-1'>
          <div className='label'>Статус</div>
          <span className='text-xs'>{state}</span>
        </div>
      </div>
      {bet_end && (
        <div className='flex-i center gap-1'>
          <div className='label'>Закрытие ставок</div>
          <span className='text-xs'>{new Date(bet_end).toLocaleDateString()}</span>
        </div>
      )}
      {link && (
        <div className='flex-i center gap-1'>
          <div className='label'>Источник валидации</div>
          <span className='ellipsis text-xs'>{link}</span>
        </div>
      )}
    </>
  )
}
