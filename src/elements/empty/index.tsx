import style from './empty.module.scss'
import IconSprite from '../icon'
import Loader from '../loader'
import type { IconName } from '../icon'

interface EmptyProps {
  title: string
  loading?: boolean
  size?: number
  icon?: IconName
}

export default function Empty({ title, loading, size, icon = 'draft' }: EmptyProps) {
  let classSize = style.empty
  const iconSize = size ? size : 24
  if (!size) undefined
  else if (size >= 32) classSize += ` ${style.text32}`
  else if (size >= 24) classSize += ` ${style.text24}`
  else if (size >= 20) classSize += ` ${style.text20}`
  return (
    <div className={classSize}>
      {loading ? <Loader /> : <IconSprite name={icon} size={iconSize} />}
      <div>{title}</div>
    </div>
  )
}
