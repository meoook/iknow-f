import IconSprite from './icon'

interface PredictionStatusProps {
  state: string
  date: string
  closed?: string
  created?: number
}

export default function PredictionStatus({ state, date, closed, created }: PredictionStatusProps) {
  return (
    <>
      <div className='row center gap12 lh-1'>
        <div className='flex-i center gap-1 text-sm color-brand nowrap'>
          <IconSprite name='finish' size={16} />
          {closed ? (
            <span>Завершено: {new Date(closed).toLocaleDateString()}</span>
          ) : (
            <span>Завершение: {new Date(date).toLocaleDateString()}</span>
          )}
        </div>
        <div className='flex-i center gap4 lg-hide'>
          <div className='label'>Статус</div>
          <span>{state}</span>
        </div>
        {created && (
          <div className='flex-i center gap4'>
            <span className='label'>Создано</span>
            <span>{new Date(created).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className='center gap12 lh-1 hide lg-flex'>
        <div className='flex-i center gap4'>
          <div className='label'>Статус</div>
          <span>{state}</span>
        </div>
      </div>
    </>
  )
}
