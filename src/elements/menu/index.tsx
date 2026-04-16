import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { toggleTheme } from '../../store/app.slice'
import Toggle from '../toggle'
import IconSprite from '../icon'
import Socials from './socials'
import LoginButton from './login'
import Avatar from '../avatar'
import { REGEX_ADDRESS } from '../../utils/date'
import type { IUser } from '../../types/auth.types'
import { useModalContext } from '../../services/ModalContext'
import { useSingOutMutation } from '../../services/api'

interface MenuProps {
  mobile?: boolean
  close?: () => void
}

export default function Menu({ mobile, close }: MenuProps) {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.auth)
  const { toggleDrawer } = useModalContext()
  const [signOut] = useSingOutMutation()

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const onClose = () => {
    if (mobile) toggleDrawer(false)
    else if (close) close()
  }

  const logOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    signOut()
    onClose()
  }

  const classBase = 'flex-i center w-500 nowrap w-full gap-2 hover'
  const classItem = mobile ? `primary ph-4 pv-3 ${classBase}` : `primary p-3 ${classBase}`
  const classLink = mobile ? `secondary ph-4 pv-3 ${classBase}` : `secondary p-3 ${classBase}`
  const classExit = mobile ? `color-red ph-4 pv-3 ${classBase}` : `color-red p-3 ${classBase}`
  return (
    <>
      {user && <MenuUser mobile={mobile} onClick={onClose} user={user} />}
      <Link to='/leaderboard' className={classItem}>
        <IconSprite name='crown' size={20} color='var(--color-brand)' />
        <span>Таблица лидеров</span>
      </Link>
      <button className={classItem}>
        <IconSprite name='activity' size={20} color='var(--color-red)' />
        <span>Активность</span>
      </button>
      <button className={classItem} onClick={handleToggleTheme}>
        <IconSprite name='moon' size={20} color='var(--color-blue)' />
        <span>Темная тема</span>
        <div className='w-full' />
        <Toggle checked={theme === 'dark'} />
      </button>
      {user && (
        <>
          {/* <Link to='/predictions' className={classItem} onClick={onClose}>
            <IconSprite name='bank' size={20} color='var(--color-green)' />
            <span>Мое участие</span>
          </Link> */}
          <Link to='/create' className={classItem} onClick={onClose}>
            <IconSprite name='add' size={20} color='var(--color-blue-dark)' />
            <span>Создать прогноз</span>
          </Link>
        </>
      )}
      <hr />
      <Link className={classLink} to='/tos' onClick={onClose}>
        Условия использования
      </Link>
      <Link className={classLink} to='/about' onClick={onClose}>
        О приложении
      </Link>
      <Link className={classLink} to='/docs' onClick={onClose}>
        Документация
      </Link>

      {mobile && <SocialsBlock />}

      {!user && mobile && <LoginButton mobile />}

      {user && (
        <button className={classExit} onClick={logOut}>
          <IconSprite name='exit' size={20} />
          <span>Выйти</span>
        </button>
      )}
    </>
  )
}

interface MenuUserProps {
  user: IUser
  mobile?: boolean
  onClick?: () => void
}

function MenuUser({ user, mobile, onClick }: MenuUserProps) {
  const username = REGEX_ADDRESS.test(user.username)
    ? user.username.slice(0, 6) + '...' + user.username.slice(-6)
    : user.username

  const paddingX = mobile ? 'ph-3' : 'pv-1 ph-3'
  return (
    <>
      <Link className={`row center gap-2 ${paddingX} h-brand`} to={`/user/${user.id}`} onClick={onClick}>
        <Avatar src={user.avatar} size={mobile ? 'md' : 'sm'} />
        {mobile ? (
          <div className='column'>
            <h3 className='ellipsis'>{username}</h3>
            <div className='text-xs color-green w-500'>${user.balances.CASH.toFixed(2)}</div>
            {/* <div className='text-xs color-green'>
              $
              {user.balances.CASH.toLocaleString(undefined, {
                notation: 'compact',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div> */}
          </div>
        ) : (
          <h3 className='ellipsis'>{username}</h3>
        )}
      </Link>
      <hr />
    </>
  )
}

const SocialsBlock = () => (
  <>
    <hr />
    <div className='p-4'>
      <Socials />
    </div>
    <hr />
  </>
)
