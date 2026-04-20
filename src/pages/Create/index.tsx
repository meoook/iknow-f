import s from './create.module.scss'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { useCreateRequestMutation } from '../../services/api'
import type { IRequestCreate } from '../../types/app.types'
import DateSelect from '../../elements/dateselect'
import IconSprite from '../../elements/icon'
import Loader from '../../elements/loader'
import TradeInput from '../../elements/trade-input/TradeInput'

const VOTE_YES_NAME = 'Да / Сбудется'
const VOTE_NO_NAME = 'Нет / Не сбудется'

export default function PageCreateRequest() {
  const user = useAppSelector((state) => state.auth.user)
  const { settings } = useAppSelector((state) => state.app)
  const [createRequest, { isLoading, isError }] = useCreateRequestMutation()
  const [formData, setFormData] = useState<IRequestCreate>({
    title: '',
    rules: '',
    link: '',
    choices: [VOTE_YES_NAME, VOTE_NO_NAME],
    vote: VOTE_YES_NAME,
    currency: 'CASH',
    amount: 0,
    end_date: '',
    bet_date: '',
  })
  const [errors, setErrors] = useState({
    title: '',
    rules: '',
    link: '',
    choices: '',
    vote_choice: '',
    amount: '',
    end_date: '',
    bet_date: '',
  })
  const [error, setError] = useState<string>('')
  const [choiceInput, setChoiceInput] = useState('')
  const [amountInput, setAmountInput] = useState(formData.amount.toString())
  const [activeTab, setActiveTab] = useState<'yesno' | 'choices'>('yesno')
  const [isTilt, setIsTilt] = useState(false)

  useEffect(() => {
    if (isError) setError('Ошибка при создании прогноза')
  }, [isError])

  const tilt = () => {
    setIsTilt(true)
    setTimeout(() => setIsTilt(false), 500)
  }

  const validForm = (): boolean => {
    const currentBalance = user?.balances[formData.currency] || 0
    // if (formData.title.trim() === '') console.log('title')
    // if (formData.rules.trim() === '') console.log('rules')
    // if (formData.vote.trim() === '') console.log('vote')
    // if (formData.choices.length === 0) console.log('choices')
    // if (formData.choices.includes(formData.vote) === false) console.log('vote_choice')
    // if (!['CASH', 'POINT'].includes(formData.currency)) console.log('currency')
    // if (formData.amount <= 0) console.log('amount')
    // if (formData.amount > currentBalance) console.log('amount')
    // if (formData.end_date === '') console.log('end_date')

    return (
      formData.title.trim() !== '' &&
      formData.rules.trim() !== '' &&
      formData.vote.trim() !== '' &&
      formData.choices.length > 1 &&
      formData.choices.includes(formData.vote) &&
      ['CASH', 'POINT'].includes(formData.currency) &&
      formData.amount > 0 &&
      formData.amount <= currentBalance &&
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
    const newChoice = choiceInput.trim()
    if (!newChoice) return
    if (formData.choices.includes(newChoice)) {
      setErrors((prev) => ({ ...prev, choices: 'Такой вариант уже существует' }))
      return
    }
    setFormData((prev) => {
      const newChoices = [...prev.choices, newChoice]
      return { ...prev, choices: newChoices, vote: prev.vote || newChoice }
    })
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: '' }))
    setChoiceInput('')
    setError('')
  }

  const handleChoiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChoice()
    }
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: '' }))
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

  const handleTabChange = (tab: 'choices' | 'yesno') => {
    if (errors.choices) setErrors((prev) => ({ ...prev, choices: '' }))
    if (error) setError('')
    if (tab === activeTab) return
    setActiveTab(tab)
    setFormData((prev) => ({
      ...prev,
      vote: tab === 'yesno' ? VOTE_YES_NAME : '',
      choices: tab === 'yesno' ? [VOTE_YES_NAME, VOTE_NO_NAME] : [],
    }))
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
    if (error) setError('')

    createRequest(formData)
      .unwrap()
      .then(() => <Navigate to='/requests' />)
  }

  return (
    <div className='container'>
      <h1>Создание прогноза</h1>
      <hr />

      <div className={s.layout}>
        <div className='column gap-2 w-0'>
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
            {errors.title && <span className='error'>{errors.title}</span>}
            {!errors.title && <span className='info'>Тема предсказания</span>}
          </div>

          <div className='form-row'>
            <label htmlFor='rules'>Условия / Правила</label>
            <textarea
              id='rules'
              name='rules'
              value={formData.rules}
              onChange={handleInputChange}
              className={errors.rules ? 'outline error' : 'outline'}
              placeholder='Условия для соблюдения прогноза.'
            />
            {errors.rules && <span className='error'>{errors.rules}</span>}
            {!errors.rules && <span className='info'>Указывайте точно, без двойных трактовок</span>}
          </div>

          <div className='form-row'>
            <label htmlFor='link'>Ссылка на источник (опционально)</label>
            <input
              type='text'
              id='link'
              name='link'
              value={formData.link}
              onChange={handleInputChange}
              className={errors.link ? 'outline error' : 'outline'}
              placeholder='Ссылка'
            />
            {errors.link && <div className='error'>{errors.link}</div>}
            {!errors.link && <span className='info'>Общедоступный источник для проверки</span>}
          </div>

          <div className={s.dates}>
            <DateSelect
              title='Дата события'
              value={formData.end_date}
              onChange={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
              minDate={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
              })()}
              error={!!errors.end_date}
            />
            <DateSelect
              title='Дата закрытия ставок (опционально)'
              value={formData.bet_date}
              onChange={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
              minDate={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
              })()}
              error={!!errors.bet_date}
              info='Если не указано, то ставки закрываются за день до наступления события'
            />
          </div>
        </div>

        <div className='column gap-5'>
          <div className={s.card}>
            <div className='row gap-4 bd-b'>
              <button
                className={`${s.tab}${activeTab === 'yesno' ? ' active' : ''}`}
                onClick={() => handleTabChange('yesno')}
                type='button'>
                Да / Нет
              </button>
              <button
                className={`${s.tab}${activeTab === 'choices' ? ' active' : ''}`}
                onClick={() => handleTabChange('choices')}
                type='button'>
                Варианты
              </button>
            </div>

            {activeTab === 'choices' ? (
              <div className='column gap-4'>
                <div className='row center gap-2'>
                  <input
                    type='text'
                    id='choice-input'
                    value={choiceInput}
                    onChange={(e) => setChoiceInput(e.target.value)}
                    onKeyDown={handleChoiceKeyDown}
                    className='outline'
                    placeholder='Добавить вариант'
                  />
                  <button className='btn blue' onClick={handleAddChoice} type='button'>
                    Добавить
                  </button>
                </div>
                <div className='column gap-2'>
                  {formData.choices.map((choice) => (
                    <div
                      key={choice}
                      className={`${s.item}${formData.vote === choice ? ' active' : ''}`}
                      onClick={() => handleChoiceClick(choice)}>
                      <div className={s.bullet} />
                      <span className='ellipsis grow' title={choice}>
                        {choice}
                      </span>
                      <button
                        className={s.remove}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveChoice(choice)
                        }}
                        type='button'>
                        <IconSprite name='close' size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='row center gap-3'>
                <button
                  className={`btn big w-full ${formData.vote === VOTE_YES_NAME ? 'green' : 'gray'}`}
                  value='yes'
                  onClick={handleVoteChange}>
                  Сбудется
                </button>
                <button
                  className={`btn big w-full ${formData.vote === VOTE_NO_NAME ? 'red' : 'gray'}`}
                  value='no'
                  onClick={handleVoteChange}>
                  Не сбудется
                </button>
              </div>
            )}
            {errors.choices && (
              <div className='row center alert-orange gap-1 ph-3 pv-2 bdr text-sm' title={errors.choices}>
                <IconSprite name='warning' size={20} />
                <span className='ellipsis'>{errors.choices}</span>
              </div>
            )}
          </div>

          <div className={s.card}>
            <h2 className='pv-2 bd-b'>Ставка</h2>
            <TradeInput
              currency='CASH'
              value={amountInput}
              setValue={setAmountInput}
              minimum={settings.min_cash_create}
              maximum={user?.balances.CASH ? Math.floor(user.balances.CASH) : 0}
              isTilt={isTilt}
              tilt={tilt}
            />
            {errors.amount && <div className='error'>{errors.amount}</div>}

            {/* <DateSelect
              title='Дата события'
              value={formData.end_date}
              onChange={(date) => setFormData((prev) => ({ ...prev, end_date: date }))}
              minDate={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
              })()}
              error={!!errors.end_date}
            /> */}
          </div>

          <div className='row center gap16'>
            <button className='btn blue mid w-full' onClick={handleCreate} disabled={isLoading}>
              Создать прогноз
            </button>
          </div>

          {error && (
            <div className='row center alert-orange gap-1 ph-3 pv-2 bdr text-sm'>
              <IconSprite name='warning' size={20} />
              {error}
            </div>
          )}

          {isLoading && (
            <div className='row center alert-green gap-2 ph-3 pv-2 bdr text-sm'>
              <Loader />
              Создание прогноза...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
