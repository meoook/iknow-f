import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { useCreateRequestMutation } from '../../services/api'
import type { IRequestCreate } from '../../types/app.types'
import { WizardContext } from './WizardContext'

const VOTE_YES_NAME = 'Да / Сбудется'
const VOTE_NO_NAME = 'Нет / Не сбудется'

const isUrl = (str: string) => {
  try {
    const url = str.includes('://') ? str : `https://${str}`
    const parsed = new URL(url)
    return parsed.hostname.includes('.')
  } catch (_) {
    return false
  }
}

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [createRequest, { isLoading, isError }] = useCreateRequestMutation()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<IRequestCreate>({
    title: '',
    rules: '',
    link: '',
    choices: [VOTE_YES_NAME, VOTE_NO_NAME],
    vote: VOTE_YES_NAME,
    amount: 0,
    end_date: '',
    bet_date: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>('')
  const [choiceInput, setChoiceInput] = useState('')
  const [activeTab, setActiveTab] = useState<'yesno' | 'choices'>('yesno')
  const [isTilt, setIsTilt] = useState(false)

  const minDate = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }, [])

  useEffect(() => {
    if (isError) setError('Ошибка при создании прогноза')
  }, [isError])

  const tilt = () => {
    setIsTilt(true)
    setTimeout(() => setIsTilt(false), 500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateDate = (name: string, value: string) => {
    const newErrors: Record<string, string> = {}
    const { end_date, bet_date } = formData

    if (name === 'end_date') {
      if (!value) newErrors.end_date = 'Выберите дату события'
      else if (value < minDate) newErrors.end_date = 'Не может быть раньше завтрашнего дня'

      if (bet_date) {
        if (bet_date < minDate) newErrors.bet_date = 'Не может быть раньше завтрашнего дня'
        else if (value && bet_date >= value) newErrors.bet_date = 'Не может быть позже даты события'
      }
    }

    if (name === 'bet_date' && value) {
      if (value < minDate) newErrors.bet_date = 'Не может быть раньше завтрашнего дня'
      else if (end_date && value >= end_date) newErrors.bet_date = 'Не может быть позже даты события'
    }
    return newErrors
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    const dateErrors = validateDate(name, value)
    setErrors((prev) => ({
      ...prev,
      end_date: dateErrors.end_date ?? '',
      bet_date: dateErrors.bet_date ?? '',
    }))
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Введите название'
      if (!formData.rules.trim()) newErrors.rules = 'Введите правила'
      if (formData.link.trim() && !isUrl(formData.link)) newErrors.link = 'Неверная ссылка'
    } else if (step === 2) {
      if (!formData.end_date) newErrors.end_date = 'Выберите дату события'
      else if (formData.end_date < minDate) newErrors.end_date = 'Не может быть раньше завтрашнего дня'

      if (formData.bet_date) {
        if (formData.bet_date < minDate) newErrors.bet_date = 'Не может быть раньше завтрашнего дня'
        else if (formData.bet_date >= formData.end_date) newErrors.bet_date = 'Не может быть позже даты события'
      }
    } else if (step === 3) {
      const currentBalance = user?.balance || 0
      if (formData.choices.length < 2) newErrors.choices = 'Нужно минимум 2 варианта'
      if (!formData.vote) newErrors.vote = 'Выберите ваш вариант'
      if (formData.amount <= 0) newErrors.amount = 'Введите сумму ставки'
      if (formData.amount > currentBalance) newErrors.amount = 'Недостаточно средств'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep((s) => s - 1)
    setError('')
    window.scrollTo(0, 0)
  }

  const handleAddChoice = () => {
    const newChoice = choiceInput.trim()
    if (!newChoice) return
    if (formData.choices.includes(newChoice)) {
      setErrors((prev) => ({ ...prev, choices: 'Такой вариант уже существует' }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      choices: [...prev.choices, newChoice],
      vote: prev.vote || newChoice,
    }))
    setChoiceInput('')
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.choices
      return newErrors
    })
  }

  const handleRemoveChoice = (choiceToRemove: string) => {
    setFormData((prev) => {
      const newChoices = prev.choices.filter((c) => c !== choiceToRemove)
      let newVote = prev.vote
      if (newVote === choiceToRemove) newVote = newChoices.length > 0 ? newChoices[0] : ''
      return { ...prev, choices: newChoices, vote: newVote }
    })
  }

  const handleTabChange = (tab: 'choices' | 'yesno') => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setFormData((prev) => ({
      ...prev,
      vote: tab === 'yesno' ? VOTE_YES_NAME : '',
      choices: tab === 'yesno' ? [VOTE_YES_NAME, VOTE_NO_NAME] : [],
    }))
    setErrors({})
  }

  const handleCreate = () => {
    if (validateStep()) {
      createRequest(formData)
        .unwrap()
        .then(() => navigate(`/user/${user?.id}?tab=created`))
        .catch(() => setError('Ошибка при создании'))
    }
  }

  const value = useMemo(
    () => ({
      step,
      formData,
      errors,
      error,
      choiceInput,
      activeTab,
      isTilt,
      isLoading,
      setStep,
      setFormData,
      setChoiceInput,
      setActiveTab,
      handleInputChange,
      handleDateChange,
      nextStep,
      prevStep,
      handleAddChoice,
      handleRemoveChoice,
      handleTabChange,
      handleCreate,
      tilt,
      VOTE_YES_NAME,
      VOTE_NO_NAME,
    }),
    [step, formData, errors, error, choiceInput, activeTab, isTilt, isLoading],
  )

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}
