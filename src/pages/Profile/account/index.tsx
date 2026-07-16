import style from './account.module.scss'
import { useEffect, useRef, useState } from 'react'
import { useSetAvatarMutation, useSetUserParamsMutation, useSetEmailMutation } from '../../../services/api'
import type { IUser } from '../../../types/auth.types'
import IconSprite from '../../../elements/icon'
import Avatar from '../../../elements/avatar'
import { REGEX_EMAIL } from '../../../utils/date'

export default function ProfileAccount({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [formData, setFormData] = useState({ username: user?.username || '', bio: '', email: user?.email || '' })
  const [errors, setErrors] = useState({ username: '', email: '' })
  const [setUserParams, { error: setUserParamsError }] = useSetUserParamsMutation()
  const [setEmail, { error: setEmailError, isLoading: isEmailLoading }] = useSetEmailMutation()
  const [setAvatar] = useSetAvatarMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: '', // Assuming bio might be added later to IUser
        email: user.email || '',
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
    setErrors((prev) => ({ ...prev, username: newErrors.username }))
    if (!newErrors.username) setUserParams({ username: formData.username })
  }

  const handleSaveEmail = async () => {
    const newErrors = { email: '' }
    if (!formData.email) {
      newErrors.email = 'Введите Email'
    } else if (!REGEX_EMAIL.test(formData.email)) {
      newErrors.email = 'Некорректный формат Email'
    }
    setErrors((prev) => ({ ...prev, email: newErrors.email }))
    if (!newErrors.email) {
      try {
        await setEmail({ email: formData.email }).unwrap()
      } catch (err: any) {
        // Error will be caught and shown by setEmailError hook
      }
    }
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
    <div className='column gap-3'>
      <h1>Настройки профиля</h1>
      <hr />

      <div className={style.head}>
        <div className={style.avatarWrap}>
          <Avatar src={user?.avatar} size='xl' />
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

        <div className='column gap-2'>
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
          {errors.username && <div className='error'>{errors.username}</div>}
          {setUserParamsError && <div className='error'>Такой никнейм уже существует</div>}
        </div>

        <div className='form-row'>
          <label htmlFor='email'>Почта (Email)</label>
          <div className='row gap-2 w-full'>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'outline error grow' : 'outline grow'}
              placeholder='example@mail.com'
              disabled={!!user?.email}
            />
            {!user?.email && (
              <button className='btn blue' onClick={handleSaveEmail} disabled={isEmailLoading || !formData.email}>
                {isEmailLoading ? '...' : 'Привязать'}
              </button>
            )}
          </div>
          {errors.email && <div className='error'>{errors.email}</div>}
          {setEmailError && (
            <div className='error'>
              {(setEmailError as any)?.data?.detail || 'Ошибка при сохранении почты'}
            </div>
          )}
          {user?.email && <span className='hint text-xs secondary'>Почта успешно привязана к аккаунту</span>}
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
