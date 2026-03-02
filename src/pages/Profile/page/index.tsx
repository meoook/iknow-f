import style from './page.module.scss'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../../hooks/useRedux'
import ProfileAccount from '../account'
import ProfileNotifications from '../notifications'
import ProfileTxs from '../transactions'
import ProfileWithdraw from '../withdraw'

type TabType = 'account' | 'notifications' | 'transactions' | 'withdraw'

export default function Profile() {
  const { user, loading } = useAppSelector((state) => state.auth)
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as TabType | null
  const validTabs: TabType[] = ['account', 'notifications', 'transactions', 'withdraw']
  const activeTab: TabType = tabParam && validTabs.includes(tabParam) ? tabParam : 'account'

  const setActiveTab = (tab: TabType) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)
  }

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
            className={`${style.item} ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}>
            Вывод средств
          </button>
        </div>

        <div className={style.main}>
          {activeTab === 'account' && <ProfileAccount user={user} loading={loading} />}
          {activeTab === 'notifications' && <ProfileNotifications user={user} loading={loading} />}
          {activeTab === 'transactions' && <ProfileTxs />}
          {activeTab === 'withdraw' && <ProfileWithdraw user={user} loading={loading} />}
        </div>
      </div>
    </div>
  )
}
