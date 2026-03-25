import style from './tapbar.module.scss'
import IconSprite from '../../elements/icon/Icon'
import { Link } from 'react-router-dom'

export default function TapBar() {
  return (
    <div className={style.bar}>
      <Link to='/' className={style.item}>
        <IconSprite name='home' />
        <span>Главная</span>
      </Link>
      <button className={style.item}>
        <IconSprite name='search' />
        <span>Поиск</span>
      </button>
      <button className={style.item}>
        <IconSprite name='menu2' />
        <span>Меню</span>
      </button>
    </div>
  )
}
