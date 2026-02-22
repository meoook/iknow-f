import style from './user.module.scss'
import IconSprite from '../../../elements/icon/Icon'
import Avatar from '../../../elements/avatar'
import { useEffect, useState } from 'react'
import { EMAIL_REGEX } from '../../../config/config'
import type { IUser } from '../../../types/auth.types'

export default function ProfileUser({ user, loading }: { user: IUser | null; loading: boolean }) {
  // const [setEmail, { isLoading: isEmailLoading }] = useSetEmailMutation()

  const [formData, setFormData] = useState({ email: user?.email || '', username: user?.username || '', bio: '' })
  const [errors, setErrors] = useState({ email: '', username: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        bio: '', // Assuming bio might be added later to IUser
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Очистка ошибки при изменении поля
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSaveChanges = async () => {
    const newErrors = { email: '', username: '' }
    if (formData.email && !EMAIL_REGEX.test(formData.email)) newErrors.email = 'Invalid email format'
    if (formData.username && formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    setErrors(newErrors)

    if (!newErrors.email && !newErrors.username) {
      try {
        // if (formData.email !== user?.email) await setEmail({ email: formData.email }).unwrap()
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

  if (loading) {
    return (
      <div className='profile-content'>
        <h1 className='profile-title'>Настройки профиля</h1>
        <div className='row center gap12'>
          <div className={`${style.avatar} shimmer`} />
          <div className={`${style.btn} shimmer`} />
        </div>
        {['Почта', 'Никнейм'].map((i) => (
          <div className='form-row' key={i}>
            <label>{i}</label>
            <div className={`${style.input} shimmer`} />
          </div>
        ))}
        <div className='form-row'>
          <label>О себе</label>
          <div className={`${style.textarea} shimmer`} />
        </div>
        <div className={`${style.btn} shimmer`} />
      </div>
    )
  }
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

      <div className='form-row'>
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
        {errors.email && <span className='error-msg'>{errors.email}</span>}
      </div>

      <div className='form-row'>
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
        {errors.username && <span className='error-msg'>{errors.username}</span>}
      </div>

      <div className='form-row'>
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

      <button className='btn blue' onClick={handleSaveChanges}>
        Сохранить
      </button>
    </div>
  )
}
