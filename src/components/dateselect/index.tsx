import style from './dateselect.module.scss'
import { useState, useEffect } from 'react'

interface DateSelectProps {
  value: string
  onChange: (date: string) => void
  minDate?: string
  error?: boolean
}

const MONTHS = [
  { value: '01', label: 'Январь' },
  { value: '02', label: 'Февраль' },
  { value: '03', label: 'Март' },
  { value: '04', label: 'Апрель' },
  { value: '05', label: 'Май' },
  { value: '06', label: 'Июнь' },
  { value: '07', label: 'Июль' },
  { value: '08', label: 'Август' },
  { value: '09', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' },
  { value: '11', label: 'Ноябрь' },
  { value: '12', label: 'Декабрь' },
]

export default function DateSelect({ value, onChange, minDate, error }: DateSelectProps) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [validationError, setValidationError] = useState('')

  // Парсим value при изменении
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-')
      setYear(y || '')
      setMonth(m || '')
      setDay(d || '')
    }
  }, [value])

  // Валидация и обновление родительского компонента
  useEffect(() => {
    if (month && day && year && year.length === 4) {
      const paddedDay = day.padStart(2, '0')
      const formattedDate = `${year}-${month}-${paddedDay}`

      // Проверяем корректность даты
      const dateObj = new Date(formattedDate)
      const isValidDate =
        dateObj.getFullYear() === parseInt(year) &&
        dateObj.getMonth() === parseInt(month) - 1 &&
        dateObj.getDate() === parseInt(day)

      if (!isValidDate) {
        setValidationError('Не верный формат даты')
        return
      }

      // Проверяем минимальную дату
      if (minDate && formattedDate < minDate) {
        const minDateObj = new Date(minDate)
        const minDateFormatted = minDateObj.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        setValidationError(`Дата не может быть раньше ${minDateFormatted}`)
        return
      }

      setValidationError('')
      onChange(formattedDate)
    } else {
      setValidationError('')
    }
  }, [month, day, year, onChange, minDate])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value)
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Только цифры
    if (val.length <= 2) setDay(val)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Только цифры
    if (val.length <= 4) setYear(val)
  }

  return (
    <div className='form-row'>
      <div className={`${style.container} ${error || validationError ? style.error : ''}`}>
        <input
          type='text'
          className={`${style.day} outline`}
          placeholder='День'
          value={day}
          onChange={handleDayChange}
          maxLength={2}
          inputMode='numeric'
        />
        <select className={`${style.month} outline`} value={month} onChange={handleMonthChange}>
          <option value=''>Месяц</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <input
          type='text'
          className={`${style.year} outline`}
          placeholder='Год'
          value={year}
          onChange={handleYearChange}
          maxLength={4}
          inputMode='numeric'
        />
      </div>
      {validationError && <div className='error-msg'>{validationError}</div>}
    </div>
  )
}
