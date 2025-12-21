import style from './toggle.module.scss'

interface ToggleProps {
  checked: boolean
  onChange?: () => void
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div className={style.toggle}>
      <input type='checkbox' checked={checked} onChange={onChange} readOnly={!onChange} />
      <span className={style.slider} />
    </div>
  )
}
