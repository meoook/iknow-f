import style from './avatar.module.scss'
import { config } from '../../config/config'
interface AvatarProps {
  src?: string
  size?: 'big' | 'small' | 'medium'
}

export default function Avatar({ src, size }: AvatarProps) {
  let className = `${style.avatar}`
  if (size) className += ` ${size}`

  return <img className={className} src={`${config.imgBaseUrl}${src || '/avatar/no_person.jpg'}`} alt='' />
}
