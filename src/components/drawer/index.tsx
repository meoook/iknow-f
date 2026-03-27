import style from './drawer.module.scss'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import { useModalContext } from '../../services/ModalContext'
import { useSingOutMutation } from '../../services/api'
import IconSprite from '../../elements/icon/Icon'
import Avatar from '../../elements/avatar'
import ModalLogin from '../../modals/login'
import MenuLinks from '../../elements/menu/links'

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
      {isOpen && <div className='overlay mw800' onClick={onClose} />}
      <div className={`${style.drawer} noscroll${isOpen ? ` ${style.open}` : ''}`}>
        {user && (
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
        )}

        <MenuLinks mobile authed={!!user} onClick={handleLink} />

        {user ? (
          <>
            <hr />
            <button className={`${style.item} ${style.logout}`} onClick={handleLogOut}>
              <IconSprite name='exit' size={20} color='var(--color-red)' />
              <span className='color-red'>Выйти</span>
            </button>
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
      </div>
    </>
  )
}
