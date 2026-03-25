import style from './tapbar.module.scss'
import IconSprite from '../../elements/icon/Icon'
import { Link } from 'react-router-dom'

interface TapBarProps {
  tags?: string[]
}

export default function TapBar({ tags }: TapBarProps) {
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
      <Link to='/menu' className={style.item}>
        <IconSprite name='menu' />
        <span>Меню</span>
      </Link>
    </div>
  )
}
