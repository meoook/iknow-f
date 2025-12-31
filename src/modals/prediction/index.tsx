import style from './prediction.module.scss'
import { useEffect, useState } from 'react'
import DateSelect from '../../components/dateselect'
import type { IRequestCreate, TVote } from '../../types/app.types'
import { useCreateRequestMutation } from '../../services/api'
import IconSprite from '../../elements/icon/Icon'
import Loader from '../../elements/loader'

export default function ModalPrediction({ close }: { close: () => void }) {
  const [createRequest, { isLoading, isError }] = useCreateRequestMutation()
  const [formData, setFormData] = useState<IRequestCreate>({
    title: '',
    rules: '',
    vote: 'yes',
    amount: '',
    currency: '',
    end_date: '',
  })
  const [errors, setErrors] = useState({ title: '', description: '', currency: '', amount: '', end_date: '' })
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (isError) setError('Ошибка при создании прогноза')
  }, [isError])

  const validForm = (): boolean => Object.values(formData).every((value) => value.trim())
  const haveErrors = (): boolean => Object.values(errors).some((value) => value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const handleVoteChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const vote = e.currentTarget.value as TVote
    setFormData((prev) => ({ ...prev, vote }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, amount: value }))
    const amount = Number(value)
    if (isNaN(amount)) setErrors((prev) => ({ ...prev, amount: 'Неверный формат' }))
    else if (amount < 0) setErrors((prev) => ({ ...prev, amount: 'Количество не может быть отрицательным' }))
    else if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
    setError('')
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, currency: value }))
    if (errors.currency) setErrors((prev) => ({ ...prev, currency: '' }))
    setError('')
  }

  const handleCreate = () => {
    if (haveErrors()) {
      setError('Есть ошибки')
      return
    }
    if (!validForm()) {
      setError('Заполните все поля')
      return
    }
    setError('')
    createRequest(formData)
      .unwrap()
      .then(() => close())
  }

  return (
    <div className={style.wrapper}>
      <h1>Создание прогноза</h1>
      <hr />
      <div className='form-row'>
        <label htmlFor='title'>Название</label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title}
          onChange={handleInputChange}
          className={errors.title ? 'outline error' : 'outline'}
          placeholder='Название'
        />
        {errors.title && <span className='error-msg'>{errors.title}</span>}
      </div>
      <div className='form-row'>
        <label htmlFor='description'>Описание</label>
        <textarea
          id='description'
          name='description'
          value={formData.rules}
          onChange={handleInputChange}
          className={errors.description ? 'outline error' : 'outline'}
          placeholder='Детали прогноза. Общедоступные источники для проверки.'
        />
        {errors.description && <span className='error-msg'>{errors.description}</span>}
      </div>
      <div className='form-row row center gap12'>
        <button
          className={`btn col ${formData.vote === 'yes' ? 'green' : 'gray'}`}
          value='yes'
          onClick={handleVoteChange}>
          Сбудется
        </button>
        <button className={`btn col ${formData.vote === 'no' ? 'red' : 'gray'}`} value='no' onClick={handleVoteChange}>
          Не сбудется
        </button>
      </div>
      <div className='form-row'>
        <div className='row center gap16'>
          <div className='col'>
            <label htmlFor='currency'>Валюта</label>
            <select
              id='currency'
              name='currency'
              className={errors.currency ? 'outline error' : 'outline'}
              defaultValue=''
              onChange={handleCurrencyChange}>
              <option value='' disabled>
                Выберите валюту
              </option>
              <option value='STR'>Баллы</option>
              <option value='USD'>Крипта</option>
              <option value='RUB'>Кэш</option>
            </select>
          </div>
          <div className='col'>
            <label htmlFor='amount'>Количество</label>
            <input
              id='amount'
              name='amount'
              value={formData.amount}
              onChange={handleAmountChange}
              className={errors.amount ? 'outline error' : 'outline'}
              placeholder='Количество'
              inputMode='numeric'
            />
          </div>
        </div>
        {(errors.currency || errors.amount) && <div className='error-msg'>{errors.currency || errors.amount}</div>}
      </div>
      <label>Дата события / Дата окончания прогноза</label>
      <DateSelect
        value={formData.end_date}
        onChange={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
        minDate={(() => {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return tomorrow.toISOString().split('T')[0]
        })()}
        error={!!errors.end_date}
      />
      <div className='row center gap16'>
        <button className='btn blue' onClick={handleCreate} disabled={isLoading}>
          Создать
        </button>
        {error && (
          <div className={style.error}>
            <IconSprite name='warning' />
            {error}
          </div>
        )}
        {isLoading && (
          <div className={style.loader}>
            <Loader />
            Создание прогноза...
          </div>
        )}
      </div>
    </div>
  )
}
