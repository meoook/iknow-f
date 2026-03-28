import { Link } from 'react-router-dom'
import type { IUser } from '../../types/auth.types'
import { REGEX_ADDRESS } from '../../utils/date'
import Avatar from '../avatar'

interface MenuUserProps {
  user: IUser
  mobile?: boolean
  onClick?: () => void
}

export default function MenuUser({ user, mobile, onClick }: MenuUserProps) {
  const username = REGEX_ADDRESS.test(user.username)
    ? user.username.slice(0, 6) + '...' + user.username.slice(-6)
    : user.username

  const paddingX = mobile ? 'pv-1 ph-4' : 'pv-1 ph-3'
  return (
    <>
      <Link className={`row center gap-3 ${paddingX} h-brand`} to='/profile' onClick={onClick}>
        <Avatar src={user.avatar} size={mobile ? 'medium' : 'small'} />
        <h3 className='ellipsis'>{username}</h3>
      </Link>
      <hr />
    </>
  )
}
