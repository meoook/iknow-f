import s from './notify.module.scss'
import React from 'react'
import { useClickOutside } from '../../hooks/hooks'
import { formatRelativeTime } from '../../utils/date'
import {
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from '../../services/api'
import { useNotificationIds, useNotification, useUnreadCount } from '../../store/notification.adapter'
import IconSprite from '../../elements/icon'

export default function NotificationBell() {
  const [readAll] = useReadAllNotificationsMutation()
  const [deleteAll] = useDeleteAllNotificationsMutation()
  const notificationIds = useNotificationIds()
  const unreadCount = useUnreadCount()
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()

  const handleDeleteAll = () => {
    deleteAll()
  }

  const openMenu = () => {
    menuToogle()
    if (unreadCount > 0) setTimeout(() => readAll(), 0)
  }

  return (
    <div className='relative' ref={menuRef}>
      <button className='btn btn-icon' onClick={openMenu}>
        <IconSprite name='bell' size={28} />
        {unreadCount > 0 && <span className={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isMenuOpen && (
        <div className={s.dropdown}>
          <div className={s.header}>
            <h3>Уведомления</h3>
            {notificationIds.length > 0 && (
              <button onClick={handleDeleteAll} className='btn btn-icon' title='Удалить все'>
                <IconSprite name='delete' size={24} />
              </button>
            )}
          </div>

          <div className={`${s.list} scroll-hide`}>
            {notificationIds.length === 0 ? (
              <div className={s.empty}>
                <IconSprite name='bell-z' />
                <div>Нет уведомлений</div>
              </div>
            ) : (
              notificationIds.map((id) => <Notification key={id} notificationId={id} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const NotificationItem = ({ notificationId }: { notificationId: number }) => {
  const notification = useNotification(notificationId)
  const [readOne] = useReadNotificationMutation()
  const [deleteOne] = useDeleteNotificationMutation()

  if (!notification) return null

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteOne(notification.id)
  }

  const alertType = notification.alert_type.toLowerCase() as any
  let itemClass = s.item
  if (!notification.read) itemClass += ` ${s.unread}`
  return (
    <div className={itemClass} onClick={() => !notification.read && readOne(notification.id)}>
      <div className={`${s.icon} ${alertType}`}>
        <IconSprite name={alertType} size={28} />
      </div>
      <div className='column gap4'>
        <div>{notification.title}</div>
        <div className={s.message}>{notification.text}</div>
        <div className={s.time}>{formatRelativeTime(notification.created)}</div>
      </div>
      <button className={s.close} onClick={handleDelete}>
        <IconSprite name='close' size={16} />
      </button>
    </div>
  )
}

const Notification = React.memo(NotificationItem)
