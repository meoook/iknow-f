import style from './tapbar.module.scss'
import IconSprite from '../../elements/icon/Icon'

interface TapBarProps {
  tags?: string[]
}

export default function TapBar({ tags }: TapBarProps) {
  return (
    <div className={style.bar}>
      <div>test</div>
    </div>
  )
}
