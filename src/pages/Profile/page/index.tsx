import style from './page.module.scss'
import { useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import ProfileAccount from '../account'
import ProfileNotifications from '../notifications'
import ProfileTxs from '../transactions'

type TabType = 'account' | 'notifications' | 'transactions' | 'security'

export default function Profile() {
  // const user = useAppSelector((state) => state.auth.user)
  const { user, loading } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<TabType>('account')

  return (
    <div className='container'>
      <div className={style.profile}>
        <div className={style.sidebar}>
          <button
            className={`${style.item} ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}>
            Профиль
          </button>
          <button
            className={`${style.item} ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}>
            Уведомления
          </button>
          <button
            className={`${style.item} ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}>
            Транзакции
          </button>
          <button
            className={`${style.item} ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}>
            Безопасность
          </button>
        </div>

        <div className={style.main}>
          {activeTab === 'account' && <ProfileAccount user={user} loading={loading} />}
          {activeTab === 'notifications' && <ProfileNotifications user={user} loading={loading} />}
          {activeTab === 'transactions' && <ProfileTxs />}
          {activeTab === 'security' && <div>Xxx</div>}
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
          <div>Xxx</div>
        </div>
      </div>
    </div>
  )
}
