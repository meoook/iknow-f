import style from './user.module.scss'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/application/appContext'
import { IApiUser } from '../../model'
import Tag from '../../elements/tag'

interface ModalProfileProps {
  username: string
}

export default function ModalUser({ username }: ModalProfileProps) {
  const [user, setUser] = useState<IApiUser>()
  const { getUser, users } = useContext(AppContext)

  useEffect(() => {
    if (!user) {
      if (username in users) setUser(users[username])
      else getUser(username)
    }
  }, [username, user, users, getUser])

  return (
    <div className={style.wrapper}>
      {!user && <PreLoader />}
      {user && (
        <>
          <div className={style.layout}>
            <div className={style.avatar}>
              <img src={user.avatar} alt='ava' />
            </div>
            <div>
              <div className={style.title} title={user.name}>
                {user.name}
              </div>
              <div className={style.username}>{user.username}</div>
              <div className={style.tags}>
                {user.is_muted && <Tag tag='Muted' color='blue' />}
                {user.is_blocked && <Tag tag='Blocked' color='red' />}
              </div>
            </div>
          </div>
          <div className={style.buttons}>
            {user.is_blocked !== null && <button className='btn green'>Subscribe</button>}
            {user.is_muted !== null && (
              <button className='btn blue outline'>{user.is_muted ? 'Unmute' : 'Mute'}</button>
            )}
            {user.is_blocked !== null && (
              <button className='btn red outline'>{user.is_blocked ? 'Unblock' : 'Block'}</button>
            )}
            {user.is_blocked !== null && <button className='btn red'>Report</button>}
          </div>
        </>
      )}
    </div>
  )
}

const PreLoader = () => (
  <div className={style.timeline}>
    <div className='shimmer'>
      <div className={`${style.masker} ${style.line0}`}></div>
      <div className={`${style.masker} ${style.box1}`}></div>
      <div className={`${style.masker} ${style.line1}`}></div>
      <div className={`${style.masker} ${style.box2}`}></div>
      <div className={`${style.masker} ${style.box3}`}></div>
      <div className={`${style.masker} ${style.line2}`}></div>
    </div>
  </div>
)
