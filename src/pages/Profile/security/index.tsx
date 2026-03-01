import style from './security.module.scss'
import IconSprite from '../../../elements/icon/Icon'
import Avatar from '../../../elements/avatar'
import { useEffect, useState } from 'react'
import { EMAIL_REGEX } from '../../../config/config'
import type { IUser } from '../../../types/auth.types'

export default function ProfileSecurity({ user, loading }: { user: IUser | null; loading: boolean }) {
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
      <>
        <h1>Настройки профиля</h1>
        <div className={style.head}>
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
      </>
    )
  }
  return (
    <div className='column gap12'>
      <h1>Настройки безопасности</h1>
      <hr />

      <div className={style.head}>
        хахахах
      </div>

    </div>
  )
}
