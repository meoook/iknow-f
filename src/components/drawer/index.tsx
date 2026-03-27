import style from './drawer.module.scss'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import { useModalContext } from '../../services/ModalContext'
import { useSingOutMutation } from '../../services/api'
import IconSprite from '../../elements/icon/Icon'
import Avatar from '../../elements/avatar'
import Toggle from '../../elements/toggle'
import ModalLogin from '../../modals/login'
import ModalDeposit from '../../modals/deposit'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const { user } = useAppSelector((state) => state.auth)
  const { theme } = useAppSelector((state) => state.app)
  const dispatch = useAppDispatch()
  const { openModal } = useModalContext()
  const [signOut] = useSingOutMutation()

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleLogOut = () => {
    onClose()
    signOut()
  }

  const handleLink = () => {
    onClose()
  }

  return (
    <>
      {isOpen && <div className={style.overlay} onClick={onClose} />}
      <div className={`${style.drawer} noscroll${isOpen ? ` ${style.open}` : ''}`}>
        {user ? (
          <>
            <Link className={style.user} to='/profile' onClick={handleLink}>
              <Avatar src={user.avatar} />
              <div>
                <span>{user.address.slice(0, 6) + '...' + user.address.slice(-6)}</span>
                {user.username !== user.address && <span className={style.username}>{user.username}</span>}
              </div>
            </Link>
            <hr className={style.divider} />
          </>
        ) : (
          <div className={style.authButtons}>
            <button
              className='btn blue w100'
              onClick={() => {
                openModal(ModalLogin)
                onClose()
              }}>
              Войти
            </button>
          </div>
        )}

        <div className={style.nav}>
          <button className={style.item}>
            <IconSprite name='crown' size={20} color='var(--color-brand)' />
            <span>Таблица лидеров</span>
          </button>
          <button className={style.item}>
            <IconSprite name='activity' size={20} color='var(--color-red)' />
            <span>Активность</span>
          </button>
          <button className={style.item} onClick={handleToggleTheme}>
            <IconSprite name='moon' size={20} color='var(--color-blue)' />
            <span>Темная тема</span>
            <div className='w100' />
            <Toggle checked={theme === 'dark'} />
          </button>
          {user && (
            <Link to='/predictions' className={style.item} onClick={handleLink}>
              <IconSprite name='bank' size={20} color='var(--color-green)' />
              <span>Мое участие</span>
            </Link>
          )}
          {user && (
            <button
              className={style.item}
              onClick={() => {
                openModal(ModalDeposit)
                onClose()
              }}>
              <IconSprite name='upload' size={20} color='var(--color-orange)' />
              <span>Депозит</span>
            </button>
          )}
        </div>

        <hr />

        <div className={style.links}>
          <Link className={style.link} to='/tos' onClick={handleLink}>
            Условия использования
          </Link>
          <Link className={style.link} to='/about' onClick={handleLink}>
            О приложении
          </Link>
          <Link className={style.link} to='/docs' onClick={handleLink}>
            Документация
          </Link>
        </div>

        {user && (
          <>
            <hr />
            <button className={`${style.item} ${style.logout}`} onClick={handleLogOut}>
              <IconSprite name='exit' size={20} color='var(--color-red)' />
              <span className='color-red'>Выйти</span>
            </button>
          </>
        )}
      </div>
    </>
  )
}
