import style from './page.module.scss'
import { useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import ProfileUser from '../user'

type TabType = 'profile' | 'account' | 'trading' | 'notifications' | 'builder' | 'transactions'

export default function Profile() {
  // const user = useAppSelector((state) => state.auth.user)
  const { user, loading } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  return (
    <div className='container'>
      <div className='row'>
        <div className={style.sidebar}>
          <button
            className={`${style.item} ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}>
            Профиль
          </button>
          <button
            className={`${style.item} ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}>
            Счет
          </button>
          <button
            className={`${style.item} ${activeTab === 'trading' ? 'active' : ''}`}
            onClick={() => setActiveTab('trading')}>
            Торговля
          </button>
          <button
            className={`${style.item} ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}>
            Уведомления
          </button>
          <button
            className={`${style.item} ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}>
            Коды
          </button>
          <button
            className={`${style.item} ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}>
            Транзакции
          </button>
        </div>

        <div className={style.main}>
          {activeTab === 'profile' && <ProfileUser user={user} loading={loading} />}
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
