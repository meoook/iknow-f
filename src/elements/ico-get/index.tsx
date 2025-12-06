import style from './icon.module.scss'
import iconArray from './icons'

/**
 * @render react
 * @name Icon component
 * @description Material svg icons. Size 1em (change fontsize to resize)
 * @example
 * <Icon name='search' />
 */
export default function Icon({ name }: { name: string }) {
  const svgIcon = iconArray[name] || iconArray.close
  return <div className={style.icon}>{svgIcon}</div>
}
