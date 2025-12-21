import style from './prediction.module.scss'
import { useState } from 'react'
import DateSelect from '../../components/dateselect'
// import { AppContext } from '../../context/application/appContext'

export default function ModalPrediction() {
  const [disabled, setDisabled] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vote: 'yes',
    end_date: '',
    amount: '',
    currency: '',
  })

  const [errors, setErrors] = useState({ title: '', description: '', amount: '', currency: '', end_date: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Очистка ошибки при изменении поля
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleVoteChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { value } = e.currentTarget
    setFormData((prev) => ({ ...prev, vote: value }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, amount: value }))
    // Очистка ошибки при изменении поля
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, currency: value }))
    // Очистка ошибки при изменении поля
    if (errors.currency) setErrors((prev) => ({ ...prev, currency: '' }))
  }

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDisabled(true)
    console.log(e.currentTarget.name)

    // authNetwork(e.currentTarget.name)
  }

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Создание прогноза</h1>
      <hr />
      <div className='form-group'>
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
        {errors.title && <span className='error-message'>{errors.title}</span>}
      </div>
      <div className='form-group'>
        <label htmlFor='description'>Описание</label>
        <textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleInputChange}
          className={errors.description ? 'outline error' : 'outline'}
          placeholder='Детали прогноза. Общедоступные источники для проверки.'
        />
        {errors.description && <span className='error-message'>{errors.description}</span>}
      </div>
      <div className='form-group row center gap20'>
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
      <div className='form-group'>
        <div className='row center gap20'>
          <div className='col'>
            <label htmlFor='currency'>Валюта</label>
            <select id='currency' name='currency' className='outline' defaultValue='' onChange={handleCurrencyChange}>
              <option value='' disabled>
                Выберите валюту
              </option>
              <option value='RUB'>Рубли</option>
              <option value='USD'>Доллары</option>
              <option value='EUR'>Евро</option>
            </select>
            {errors.currency && <span className='error-message'>{errors.currency}</span>}
          </div>
          <div className='col'>
            <label htmlFor='amount'>Количество</label>
            <input
              id='amount'
              name='amount'
              value={formData.amount}
              onChange={handleInputChange}
              className={errors.amount ? 'outline error' : 'outline'}
              placeholder='Количество'
            />
            {errors.description && <span className='error-message'>{errors.description}</span>}
          </div>
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='end_date'>Дата события / Дата окончания прогноза</label>
        <DateSelect
          value={formData.end_date}
          onChange={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
          minDate={new Date().toISOString().split('T')[0]}
          error={!!errors.end_date}
        />
        {errors.end_date && <span className='error-message'>{errors.end_date}</span>}
      </div>
      <button className='btn blue' onClick={handleLogin} disabled={disabled}>
        Создать
      </button>
    </div>
  )
}
