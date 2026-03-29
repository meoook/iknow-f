import style from './drawer.module.scss'
import { useModalContext } from '../../services/ModalContext'
import Menu from '../../elements/menu'

export default function Drawer() {
  const { isDrawerOpen, toggleDrawer } = useModalContext()
  const onClose = () => toggleDrawer(false)

  return (
    <>
      {isDrawerOpen && <div className='overlay hide md' onClick={onClose} />}
      <div className={`${style.drawer} hide md noscroll${isDrawerOpen ? ' open' : ''}`}>
        <Menu mobile />
      </div>
    </>
  )
}
