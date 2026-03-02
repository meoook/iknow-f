import style from './toggle.module.scss'

interface ToggleProps {
  checked: boolean
  onChange?: () => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <div className={style.toggle} onClick={onChange}>
      <input type='checkbox' checked={checked} readOnly={!onChange} />
      <span className={style.slider} />
    </div>
  )
}
