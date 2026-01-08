import style from './notify.module.scss'
import { useClickOutside } from '../../hooks/hooks'
import { useAppSelector } from '../../hooks/useRedux'
import IconSprite from '../../elements/icon/Icon'
import type { INotification } from '../../types/app.types'
import { formatRelativeTime } from '../../utils/date'
import {
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from '../../services/api'

export const NotificationBell = () => {
  const [readAll] = useReadAllNotificationsMutation()
  const [deleteAll] = useDeleteAllNotificationsMutation()
  const { notifications, unreadCount } = useAppSelector((state) => state.app)
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()

  const handleDeleteAll = () => {
    deleteAll()
  }

  const openMenu = () => {
    menuToogle(null as any)
    setTimeout(() => readAll(), 0)
  }

  return (
    <div className={style.container} ref={menuRef}>
      <button className='btn btn-icon' onClick={openMenu}>
        <IconSprite name='bell' size={28} />
        {unreadCount > 0 && <span className={style.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isMenuOpen && (
        <div className={style.dropdown}>
          <div className={style.header}>
            <h3>Уведомления</h3>
            <button onClick={handleDeleteAll} className='btn btn-icon' title='Удалить все'>
              <IconSprite name='delete' size={24} />
            </button>
          </div>

          <div className={`${style.list} noscroll`}>
            {notifications.length === 0 ? (
              <div className={style.empty}>
                <IconSprite name='bell-z' />
                <div>Нет уведомлений</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({ notification }: { notification: INotification }) {
  const [readOne] = useReadNotificationMutation()
  const [deleteOne] = useDeleteNotificationMutation()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteOne(notification.id)
  }

  const alertType = notification.alert_type.toLowerCase() as any
  let itemClass = style.item
  if (!notification.read) itemClass += ` ${style.unread}`
  return (
    <div className={itemClass} onClick={() => !notification.read && readOne(notification.id)}>
      <div className={`${style.icon} ${alertType}`}>
        <IconSprite name={alertType} size={28} />
      </div>
      <div className='column gap4'>
        <div>{notification.title}</div>
        <div className={style.message}>{notification.text}</div>
        <div className={style.time}>{formatRelativeTime(notification.created)}</div>
      </div>
      <div className={style.close} onClick={handleDelete}>
        <IconSprite name='close' size={16} />
      </div>
    </div>
  )
}
