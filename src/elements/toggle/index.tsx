import style from './toggle.module.scss'

interface ToggleProps {
  checked: boolean
  onChange?: () => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  const className = `${style.toggle}${checked ? ' active' : ''}${disabled ? ' disabled' : ''}`

  return (
    <div className={className} onClick={disabled ? undefined : onChange}>
      <span className={style.slider} />
    </div>
  )
}
