import style from './notify.module.scss'
import { useClickOutside } from '../../hooks/hooks'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import { markAllAsRead, markAsRead } from '../../store/notification.slice'
import IconSprite from '../../elements/icon/Icon'

export const NotificationBell = () => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications)
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  return (
    <div className={style.container} ref={menuRef}>
      <button className='btn btn-icon' onClick={menuToogle}>
        <IconSprite name='bell' size={28} />
        {unreadCount > 0 && <span className={style.badge}>{unreadCount}</span>}
      </button>

      {isMenuOpen && (
        <div className={style.dropdown}>
          <div className={style.header}>
            <h3>Уведомления</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className={style.read}>
                Пометить все как прочитанное
              </button>
            )}
          </div>

          <div className={style.list}>
            {notifications.length === 0 ? (
              <div className={style.empty}>
                <IconSprite name='bell-z' />
                <div>Нет уведомлений</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${style.item} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                  <div className={`${style.type} ${notification.type}`}>{notification.type}</div>
                  <div className={style.message}>{notification.message}</div>
                  <div className={style.time}>{new Date(notification.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
