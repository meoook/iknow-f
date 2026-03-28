import style from './account.module.scss'
import { useEffect, useRef, useState } from 'react'
import { useSetAvatarMutation, useSetUserParamsMutation } from '../../../services/api'
import type { IUser } from '../../../types/auth.types'
import IconSprite from '../../../elements/icon'
import Avatar from '../../../elements/avatar'

export default function ProfileAccount({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [formData, setFormData] = useState({ username: user?.username || '', bio: '' })
  const [errors, setErrors] = useState({ username: '' })
  const [setUserParams, { error: setUserParamsError }] = useSetUserParamsMutation()
  const [setAvatar] = useSetAvatarMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: '', // Assuming bio might be added later to IUser
      })
    }
  }, [user])

  useEffect(() => {
    fileInputRef.current = document.createElement('input')
    fileInputRef.current.setAttribute('type', 'file')
    fileInputRef.current.setAttribute('accept', 'image/*')
    fileInputRef.current.addEventListener('change', handleFileChange)
    // eslint-disable-next-line
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSaveChanges = async () => {
    const newErrors = { username: '' }
    if (formData.username && formData.username.length < 4) {
      newErrors.username = 'Никнейм должен быть не менее 4 символов'
    }
    setErrors(newErrors)
    if (!newErrors.username) setUserParams({ username: formData.username })
  }

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    // Сброс input чтобы повторный выбор того же файла тоже срабатывал
    input.value = ''
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setUploadProgress(0)
    setUploadError(null)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 90) return prev
        return prev + Math.floor(Math.random() * 5) + 1
      })
    }, 100)

    try {
      await setAvatar(file).unwrap()
      clearInterval(interval)
      setUploadProgress(100)
      // dispatch(updateUser({ avatar: res.avatar }))

      // Даем пользователю увидеть 100% перед скрытием
      setTimeout(() => {
        setUploadProgress(null)
      }, 1000)
    } catch (err: any) {
      clearInterval(interval)
      setUploadProgress(null)
      setUploadError(err?.data?.detail || 'Ошибка при загрузке аватара')
    }
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
    <div className='column gap12'>
      <h1>Настройки профиля</h1>
      <hr />

      <div className={style.head}>
        <div className={style.avatarWrap}>
          <Avatar src={user?.avatar} size='big' />
          {uploadProgress !== null && (
            <div className={style.progressOverlay}>
              <svg className={style.progressRing} viewBox='0 0 80 80'>
                <circle className={style.progressBg} cx='40' cy='40' r='34' />
                <circle
                  className={style.progressArc}
                  cx='40'
                  cy='40'
                  r='34'
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - uploadProgress / 100)}`}
                />
              </svg>
              <span className={style.progressText}>{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className='column gap8'>
          <button className='btn gray' onClick={() => fileInputRef.current?.click()} disabled={uploadProgress !== null}>
            <IconSprite name='upload' size={20} />
            <span>{uploadProgress !== null ? 'Загрузка...' : 'Загрузить'}</span>
          </button>
          {uploadError && <span className={style.error}>{uploadError}</span>}
        </div>
      </div>

      <div>
        <div className='form-row'>
          <label htmlFor='username'>Никнейм</label>
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleInputChange}
            className={errors.username ? 'outline error' : 'outline'}
            placeholder='Никнейм'
          />
          {errors.username && <span className='error-msg'>{errors.username}</span>}
          {setUserParamsError && <span className='error-msg'>Такой никнейм уже существует</span>}
        </div>

        <div className='form-row'>
          <label htmlFor='bio'>О себе</label>
          <textarea
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
    </div>
  )
}
