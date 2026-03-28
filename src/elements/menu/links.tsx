import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import Toggle from '../toggle'
import IconSprite from '../icon'

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

  const classBase = 'flex-i center w-500 nowrap w-full gap-2 hover'
  const classItem = mobile ? `primary ph-4 pv-3 ${classBase}` : `primary p-3 ${classBase}`
  const classLink = mobile ? `secondary ph-4 pv-3 ${classBase}` : `secondary p-3 ${classBase}`
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
