import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { markAsRead, markAllAsRead } from '../store/notification.slice'
import './NotificationBell.scss'

export const NotificationBell = () => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications)
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  return (
    <div className='notification-bell'>
      <button className='bell-button' onClick={handleToggle}>
        <span className='bell-icon'>🔔</span>
        {unreadCount > 0 && <span className='bell-badge'>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className='notification-dropdown'>
          <div className='notification-header'>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className='mark-all-read'>
                Mark all as read
              </button>
            )}
          </div>

          <div className='notification-list'>
            {notifications.length === 0 ? (
              <div className='notification-empty'>No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                  <div className={`notification-type ${notification.type}`}>{notification.type}</div>
                  <div className='notification-message'>{notification.message}</div>
                  <div className='notification-time'>{new Date(notification.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
