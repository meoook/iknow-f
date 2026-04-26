import s from '../wizard.module.scss'
import IconSprite from '../../../elements/icon'
import { useWizard } from '../WizardContext'

export const WizardHeader = () => {
  const { step } = useWizard()
  const stepsCount = 3
  const progress = `${((step - 1) / (stepsCount - 1)) * 100}%`

  return (
    <div className='text-center'>
      <h1>Создание прогноза</h1>

      <div className={s.steps}>
        <div className={s.line} />
        <div className={s.progress} style={{ width: progress }} />
        <StepItem num={1} step={step} />
        <StepItem num={2} step={step} />
        <StepItem num={3} step={step} />
      </div>
    </div>
  )
}

const StepItem = ({ num, step }: { num: number; step: number }) => {
  const label = { 1: 'Инфо', 2: 'Даты', 3: 'Ставка' }[num]

  const className = [s.step]
  if (step === num) className.push(s.active)
  if (step > num) className.push(s.completed)
  return (
    <div className={className.join(' ')}>
      <div className={s.circle}>{step > num ? <IconSprite name='check' size={16} /> : num}</div>
      <div className={s.label}>{label}</div>
    </div>
  )
}
