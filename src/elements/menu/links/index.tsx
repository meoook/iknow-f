import s from './links.module.scss'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux'
import { toggleTheme } from '../../../store/app.slice'
import IconSprite from '../../icon/Icon'
import Toggle from '../../toggle'

interface MenuLinksInfoProps {
  mobile?: boolean
  authed?: boolean
  onClick?: () => void
}

export default function MenuLinks({ mobile, authed, onClick }: MenuLinksInfoProps) {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.app)

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const classItem = mobile ? `${s.item} big` : s.item
  const classLink = mobile ? `${s.link} big` : s.link
  return (
    <>
      <button className={classItem}>
        <IconSprite name='crown' size={20} color='var(--color-brand)' />
        <span>Таблица лидеров</span>
      </button>
      <button className={classItem}>
        <IconSprite name='activity' size={20} color='var(--color-red)' />
        <span>Активность</span>
      </button>
      <button className={classItem} onClick={handleToggleTheme}>
        <IconSprite name='moon' size={20} color='var(--color-blue)' />
        <span>Темная тема</span>
        <div className='w100' />
        <Toggle checked={theme === 'dark'} />
      </button>
      {authed && (
        <Link to='/predictions' className={classItem} onClick={onClick}>
          <IconSprite name='bank' size={20} color='var(--color-green)' />
          <span>Мое участие</span>
        </Link>
      )}
      <hr />
      <Link className={classLink} to='/tos' onClick={onClick}>
        Условия использования
      </Link>
      <Link className={classLink} to='/about' onClick={onClick}>
        О приложении
      </Link>
      <Link className={classLink} to='/docs' onClick={onClick}>
        Документация
      </Link>
    </>
  )
}
