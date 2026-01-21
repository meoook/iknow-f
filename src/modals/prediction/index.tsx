import style from './prediction.module.scss'
import { useEffect, useState } from 'react'
import DateSelect from '../../components/dateselect'
import type { IRequestCreate } from '../../types/app.types'
import { useCreateRequestMutation } from '../../services/api'
import IconSprite from '../../elements/icon/Icon'
import Loader from '../../elements/loader'
import type { TCurrency } from '../../types/auth.types'

const VOTE_YES_NAME = 'Да / Сбудется'
const VOTE_NO_NAME = 'Нет / Не сбудется'

export default function ModalPrediction({ close }: { close: () => void }) {
  const [createRequest, { isLoading, isError }] = useCreateRequestMutation()
  const [formData, setFormData] = useState<IRequestCreate>({
    title: '',
    rules: '',
    choices: [],
    vote: '',
    currency: 'CASH',
    amount: 0,
    end_date: '',
  })
  const [errors, setErrors] = useState({ title: '', rules: '', choices: '', vote_choice: '', amount: '', end_date: '' })
  const [error, setError] = useState<string>('')
  const [choiceInput, setChoiceInput] = useState('')

  useEffect(() => {
    if (isError) setError('Ошибка при создании прогноза')
  }, [isError])

  const validForm = (): boolean => {
    return (
      formData.title.trim() !== '' &&
      formData.rules.trim() !== '' &&
      formData.choices.length > 0 &&
      formData.vote !== '' &&
      ['CASH', 'POINT'].includes(formData.currency) &&
      formData.amount !== 0 &&
      formData.end_date !== ''
    )
  }
  const haveErrors = (): boolean => Object.values(errors).some((value) => value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const handleAddChoice = () => {
    if (choiceInput.trim()) {
      const newChoice = choiceInput.trim()
      if (formData.choices.includes(newChoice)) {
        setError('Такой вариант уже есть')
        return
      }
      setFormData((prev) => {
        const newChoices = [...prev.choices, newChoice]
        return { ...prev, choices: newChoices, vote: prev.vote || newChoice }
      })
      setChoiceInput('')
      setError('')
    }
  }

  const handleChoiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChoice()
    }
  }

  const handleRemoveChoice = (choiceToRemove: string) => {
    setFormData((prev) => {
      const newChoices = prev.choices.filter((c) => c !== choiceToRemove)
      let newVote = prev.vote
      if (newVote === choiceToRemove) newVote = newChoices.length > 0 ? newChoices[0] : ''
      return { ...prev, choices: newChoices, vote: newVote }
    })
  }

  const handleChoiceClick = (choice: string) => {
    setFormData((prev) => ({ ...prev, vote: choice }))
  }

  const handleVoteChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const vote = e.currentTarget.value === 'yes' ? VOTE_YES_NAME : VOTE_NO_NAME
    setFormData((prev) => ({ ...prev, vote }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const amount = Number(value)
    setFormData((prev) => ({ ...prev, amount }))
    if (isNaN(amount)) setErrors((prev) => ({ ...prev, amount: 'Неверный формат' }))
    else if (amount < 0) setErrors((prev) => ({ ...prev, amount: 'Количество не может быть отрицательным' }))
    else if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
    setError('')
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, currency: value as TCurrency }))
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
    <div className={`${style.wrapper} noscroll`}>
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
        <label htmlFor='choice-input'>Варианты</label>
        <div className='row center gap8'>
          <input
            type='text'
            id='choice-input'
            value={choiceInput}
            onChange={(e) => setChoiceInput(e.target.value)}
            onKeyDown={handleChoiceKeyDown}
            className='outline'
            placeholder='Добавить вариант'
          />
          <button className='btn blue' onClick={handleAddChoice}>
            Добавить
          </button>
        </div>
        <div className={style.chips}>
          {formData.choices.map((choice) => (
            <div
              key={choice}
              className={`${style.chip} ${formData.vote === choice ? style.active : ''}`}
              onClick={() => handleChoiceClick(choice)}>
              <span className='line-clamp-1' title={choice}>
                {choice}
              </span>
              <button
                className={style.remove}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveChoice(choice)
                }}>
                <IconSprite name='close' size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className='form-row'>
        <label htmlFor='rules'>Условия / Правила</label>
        <textarea
          id='rules'
          name='rules'
          value={formData.rules}
          onChange={handleInputChange}
          className={errors.rules ? 'outline error' : 'outline'}
          placeholder='Условия для соблюдения прогноза. Общедоступные источники для проверки.'
        />
        {errors.rules && <span className='error-msg'>{errors.rules}</span>}
      </div>
      <div className='form-row row center gap12'>
        <button className={`btn w100 big ${formData.vote ? 'green' : 'gray'}`} value='yes' onClick={handleVoteChange}>
          Сбудется
        </button>
        <button className={`btn w100 big ${!formData.vote ? 'red' : 'gray'}`} value='no' onClick={handleVoteChange}>
          Не сбудется
        </button>
      </div>
      <div className='form-row'>
        <div className='row center gap16'>
          <div className='w100'>
            <label htmlFor='currency'>Валюта</label>
            <select id='currency' name='currency' className='outline' defaultValue='' onChange={handleCurrencyChange}>
              <option value='' disabled>
                Выберите валюту
              </option>
              <option value='POINT'>Баллы</option>
              <option value='CASH'>Кэш</option>
            </select>
          </div>
          <div className='w100'>
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
        {errors.amount && <div className='error-msg'>{errors.amount}</div>}
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
