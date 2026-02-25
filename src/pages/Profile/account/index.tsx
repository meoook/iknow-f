import style from './account.module.scss'
import { useEffect, useState } from 'react'
import type { IUser } from '../../../types/auth.types'
import IconSprite from '../../../elements/icon/Icon'
import Avatar from '../../../elements/avatar'
import { useSetUsernameMutation } from '../../../services/api'

export default function ProfileAccount({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [formData, setFormData] = useState({ username: user?.username || '', bio: '' })
  const [errors, setErrors] = useState({ username: '' })
  const [setUsername, { error: setUsernameError }] = useSetUsernameMutation()

  useEffect(() => {
    if (user) {
      setFormData({
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
    const newErrors = { username: '' }
    if (formData.username && formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    setErrors(newErrors)

    if (!newErrors.username) {
      setUsername({ username: formData.username })
      try {
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
      <>
        <h1>Настройки профиля</h1>
        <div className={style.head}>
          <div className={`${style.avatar} shimmer`} />
          <div className={`${style.btn} shimmer`} />
        </div>
        <div className='form-row'>
          <label>Никнейм</label>
          <div className={`${style.input} shimmer`} />
        </div>
        <div className='form-row'>
          <label>О себе</label>
          <div className={`${style.textarea} shimmer`} />
        </div>
        <div className={`${style.btn} shimmer`} />
      </>
    )
  }
  return (
    <>
      <h1>Настройки профиля</h1>

      <div className={style.head}>
        <Avatar src={user?.avatar} size='big' />
        <button className='btn gray' onClick={handleAvatarUpload}>
          <IconSprite name='upload' size={20} />
          <span>Загрузить</span>
        </button>
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
        {setUsernameError && <span className='error-msg'>Такой никнейм уже существует</span>}
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
    </>
  )
}
