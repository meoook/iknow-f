import style from './icon.module.scss'
import iconLangs from './icons'

/**
 * @render react
 * @name IcoLang component
 * @description Country flags svg icons. Size 1em (change fontsize to resize)
 * @example
 * <IcoLang name='german' />
 */

const IcoLang = ({ name }: { name: string }) => {
  const langIcon = iconLangs[name] || iconLangs.world
  return <div className={style.Icon}>{langIcon}</div>
}

export default IcoLang
