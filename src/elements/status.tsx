import IconSprite from './icon'

interface PredictionStatusProps {
  state: string
  date: string
  volume?: number
  closed?: string
  created?: number
}

export default function PredictionStatus({ state, date, closed, created, volume }: PredictionStatusProps) {
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
          <span>{state}</span>
        </div>
        {created && (
          <div className='flex-i center gap-1'>
            <span className='label'>Создано</span>
            <span>{new Date(created).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className='row center gap-3 lh-1'>
        {volume && (
          <div className='flex-i center gap-1'>
            <div className='label'>Объем</div>
            <span>${new Intl.NumberFormat('en-US').format(volume)}</span>
          </div>
        )}
        <div className='hide lg-flex center gap-1'>
          <div className='label'>Статус</div>
          <span>{state}</span>
        </div>
      </div>
    </>
  )
}
