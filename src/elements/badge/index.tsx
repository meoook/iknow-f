import style from './badge.module.scss'
interface BadgeProps {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green' | 'orange' | 'red'
  outline?: boolean
}

export default function Badge({ children, color = 'gray', outline = false }: BadgeProps) {
  let className = `${style.badge}`
  if (color) className += ` ${color}`
  if (outline) className += ` outline`
  return <span className={className}>{children}</span>
}
