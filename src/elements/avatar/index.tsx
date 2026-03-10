import style from './avatar.module.scss'
interface AvatarProps {
  src?: string
  size?: 'big' | 'small' | 'medium'
}

export default function Avatar({ src, size }: AvatarProps) {
  let className = `${style.avatar}`
  if (size) className += ` ${size}`
  return <img className={className} src={`${import.meta.env.VITE_IMG_URL}${src || '/avatar/no_person.jpg'}`} alt='' />
}
