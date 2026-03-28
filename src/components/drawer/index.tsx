import style from './drawer.module.scss'
import { useAppSelector } from '../../hooks/useRedux'
import { useModalContext } from '../../services/ModalContext'
import { useSingOutMutation } from '../../services/api'
import IconSprite from '../../elements/icon'
import ModalLogin from '../../modals/login'
import MenuUser from '../../elements/menu/user'
import MenuLinks from '../../elements/menu/links'
import Socials from '../../elements/menu/socials'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const { user } = useAppSelector((state) => state.auth)
  const { openModal } = useModalContext()
  const [signOut] = useSingOutMutation()

  const handleLogOut = () => {
    onClose()
    signOut()
  }

  return (
    <>
      {isOpen && <div className='overlay hide md' onClick={onClose} />}
      <div className={`${style.drawer} hide md noscroll${isOpen ? ' open' : ''}`}>
        {user && <MenuUser mobile onClick={onClose} user={user} />}

        <MenuLinks mobile authed={!!user} onClick={onClose} />

        <hr />
        <div className='p-4'>
          <Socials />
        </div>
        <hr />

        {user ? (
          <>
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
