import s from './avatar.module.scss'
interface AvatarProps {
  src?: string | null
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function Avatar({ src, size }: AvatarProps) {
  const url = `${import.meta.env.VITE_IMG_URL}${src || '/avatar/no_person.jpg'}`
  return <img className={`${s.avatar} ${size}`} src={url} alt='' />
}
