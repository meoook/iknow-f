import { useState } from 'react'
import { useAppSelector } from '../hooks/useRedux'
import { useSetEmailMutation } from '../services/api'
import './Profile.scss'
import IconSprite from '../elements/icon/Icon'
import Avatar from '../components/avatar'
import { Navigate } from 'react-router-dom'

type TabType = 'profile' | 'account' | 'trading' | 'notifications' | 'builder' | 'export'

export function Profile() {
  const user = useAppSelector((state) => state.auth.user)
  const token = useAppSelector((state) => state.auth.token)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [setEmail, { isLoading: isEmailLoading }] = useSetEmailMutation()

  const [formData, setFormData] = useState({ email: user?.email || '', username: user?.username || '', bio: '' })

  const [errors, setErrors] = useState({ email: '', username: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Очистка ошибки при изменении поля
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSaveChanges = async () => {
    const newErrors = { email: '', username: '' }

    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email format'

    if (formData.username && formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'

    setErrors(newErrors)

    if (!newErrors.email && !newErrors.username) {
      try {
        if (formData.email !== user?.email) await setEmail({ email: formData.email }).unwrap()
        // TODO: Добавить сохранение username и bio когда API будет готово
        console.log('Saving changes:', formData)
      } catch (error) {
        console.error('Failed to save changes:', error)
      }
    }
  }

  const handleAvatarUpload = () => {
    // TODO: Реализовать загрузку аватара
    console.log('Upload avatar')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Настройки профиля</h1>

            <div className='profile-avatar-section'>
              <Avatar src={user?.avatar} size='big' />
              <button className='btn gray' onClick={handleAvatarUpload}>
                <IconSprite name='upload' size={20} />
                <span>Загрузить</span>
              </button>
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Почта</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'outline error' : 'outline'}
                placeholder='your@email.com'
              />
              {errors.email && <span className='error-message'>{errors.email}</span>}
            </div>

            <div className='form-group'>
              <label htmlFor='username'>Никнейм</label>
              <input
                type='text'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'outline error' : 'outline'}
                placeholder='Никнейм'
              />
              {errors.username && <span className='error-message'>{errors.username}</span>}
            </div>

            <div className='form-group'>
              <label htmlFor='bio'>О себе</label>
              <textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                className='outline'
                placeholder='О себе'
                rows={4}
              />
            </div>

            <button className='btn blue' onClick={handleSaveChanges} disabled={isEmailLoading}>
              {isEmailLoading ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        )
      case 'account':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Account Settings</h1>
            <p className='placeholder-text'>Account settings coming soon...</p>
          </div>
        )
      case 'trading':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Trading Settings</h1>
            <p className='placeholder-text'>Trading settings coming soon...</p>
          </div>
        )
      case 'notifications':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Notification Settings</h1>
            <p className='placeholder-text'>Notification settings coming soon...</p>
          </div>
        )
      case 'builder':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Builder Codes</h1>
            <p className='placeholder-text'>Builder codes coming soon...</p>
          </div>
        )
      case 'export':
        return (
          <div className='profile-content'>
            <h1 className='profile-title'>Export Private Key</h1>
            <p className='placeholder-text'>Export functionality coming soon...</p>
          </div>
        )
      default:
        return null
    }
  }

  if (!token) return <Navigate to='/login' />

  return (
    <div className='container'>
      <div className='profile-page'>
        <div className='profile-sidebar'>
          <button
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}>
            Профиль
          </button>
          <button
            className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}>
            Счет
          </button>
          <button
            className={`sidebar-item ${activeTab === 'trading' ? 'active' : ''}`}
            onClick={() => setActiveTab('trading')}>
            Торговля
          </button>
          <button
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}>
            Уведомления
          </button>
          <button
            className={`sidebar-item ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}>
            Коды
          </button>
          <button
            className={`sidebar-item ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}>
            Экспорт ключа
          </button>
        </div>

        <div className='profile-main'>{renderTabContent()}</div>
      </div>
    </div>
  )
}
