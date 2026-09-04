import style from './page.module.scss'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../../hooks/useRedux'
import ProfileAccount from '../account'
import ProfileNotifications from '../notifications'
import ProfileTxs from '../transactions'
import IconSprite from '../../../elements/icon'

type TabType = 'account' | 'balance' | 'notifications'

export default function Profile() {
  const { user, loading } = useAppSelector((state) => state.auth)
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as TabType | null
  const validTabs: TabType[] = ['account', 'balance', 'notifications']
  const activeTab: TabType = tabParam && validTabs.includes(tabParam) ? tabParam : 'account'

  const setActiveTab = (tab: TabType) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)

    if (window.scrollY > 60) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className='container'>
      <div className={style.profile}>
        <div className={style.sidebar}>
          <div className={style.nav}>
            <button
              className={`${style.item} ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}>
              <IconSprite name='pencil' size={18} />
              <span>Профиль</span>
            </button>
            <button
              className={`${style.item} ${activeTab === 'balance' ? 'active' : ''}`}
              onClick={() => setActiveTab('balance')}>
              <IconSprite name='bank' size={18} />
              <span>Баланс</span>
            </button>
            <button
              className={`${style.item} ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}>
              <IconSprite name='bell' size={18} />
              <span>Уведомления</span>
            </button>
          </div>
        </div>

        <div className={style.main}>
          {activeTab === 'account' && <ProfileAccount user={user} loading={loading} />}
          {activeTab === 'balance' && <ProfileTxs />}
          {activeTab === 'notifications' && <ProfileNotifications user={user} loading={loading} />}
        </div>
      </div>
    </div>
  )
}
