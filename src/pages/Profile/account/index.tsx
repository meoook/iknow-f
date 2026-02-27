import style from './account.module.scss'
import { useEffect, useRef, useState } from 'react'
import type { IUser } from '../../../types/auth.types'
import IconSprite from '../../../elements/icon/Icon'
import Avatar from '../../../elements/avatar'
import { useSetUserParamsMutation } from '../../../services/api'
import { LOCAL_STORAGE_TOKEN_KEY, updateUser } from '../../../store/auth.slice'
import { useAppDispatch } from '../../../hooks/useRedux'
import { config } from '../../../config/config'

export default function ProfileAccount({ user, loading }: { user: IUser | null; loading: boolean }) {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({ username: user?.username || '', bio: '' })
  const [errors, setErrors] = useState({ username: '' })
  const [setUserParams, { error: setUserParamsError }] = useSetUserParamsMutation()

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

  const uploadAvatar = (file: File) => {
    setUploadProgress(0)
    setUploadError(null)

    const formData = new FormData()
    formData.append('avatar', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { avatar: string }
          // Добавляем timestamp для сброса кеша браузера
          const cacheBusted = `${data.avatar}?t=${Date.now()}`
          dispatch(updateUser({ avatar: cacheBusted }))
        } catch {
          // если ответ не JSON — просто закрываем прогресс
        }
        setUploadProgress(null)
      } else {
        setUploadError('Ошибка загрузки')
        setUploadProgress(null)
      }
    }

    xhr.onerror = () => {
      setUploadError('Ошибка сети')
      setUploadProgress(null)
    }

    xhr.open('POST', `${config.apiBaseUrl}/auth/user/avatar`)
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)
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
        {setUserParamsError && <span className='error-msg'>Такой никнейм уже существует</span>}
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
