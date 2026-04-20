import style from './dateselect.module.scss'
import { useState, useEffect } from 'react'

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

interface DateSelectProps {
  title?: string
  info?: string
  value: string
  onChange: (date: string) => void
  minDate?: string
  maxDate?: number
  error?: boolean
}

export default function DateSelect({ title, info, value, onChange, minDate, maxDate, error }: DateSelectProps) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [validationError, setValidationError] = useState('')

  // Парсим value при изменении
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-')
      setYear(y || '')
      setMonth(m ? m.padStart(2, '0') : '')
      setDay(d ? d.padStart(2, '0') : '')
    }
  }, [value])

  // Валидация и обновление родительского компонента
  useEffect(() => {
    if (month && day && year) {
      const formattedDate = `${year}-${month}-${day}`

      // Проверяем минимальную дату
      if (minDate && formattedDate < minDate) {
        const minDateObj = new Date(minDate)
        const minDateFormatted = minDateObj.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        setValidationError(`Не может быть раньше ${minDateFormatted}`)
        onChange('')
        return
      }

      setValidationError('')
      onChange(formattedDate)
    } else {
      setValidationError('')
      onChange('')
    }
  }, [month, day, year, minDate])

  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31
    const monthNum = parseInt(m)
    const yearNum = y ? parseInt(y) : new Date().getFullYear()
    return new Date(yearNum, monthNum, 0).getDate()
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value
    setMonth(newMonth)

    const nextMaxDays = getDaysInMonth(newMonth, year)
    if (day && parseInt(day) > nextMaxDays) {
      setDay(nextMaxDays.toString().padStart(2, '0'))
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value
    setYear(newYear)

    const nextMaxDays = getDaysInMonth(month, newYear)
    if (day && parseInt(day) > nextMaxDays) {
      setDay(nextMaxDays.toString().padStart(2, '0'))
    }
  }

  const currentYear = new Date().getFullYear()
  const startYear = minDate ? new Date(minDate).getFullYear() : currentYear
  const endYear = maxDate || Math.max(startYear, currentYear + 1)
  const years = []
  for (let i = startYear; i <= endYear; i++) {
    years.push(i.toString())
  }

  const maxDays = getDaysInMonth(month, year)
  const daysList = Array.from({ length: maxDays }, (_, i) => (i + 1).toString().padStart(2, '0'))

  return (
    <div className='form-row'>
      {title && <div>{title}</div>}
      <div className={`${style.container} ${error || validationError ? style.error : ''}`}>
        <select className={`${style.day} outline`} name='day' value={day} onChange={handleDayChange}>
          <option value='' disabled hidden>
            День
          </option>
          {daysList.map((d) => (
            <option key={d} value={d}>
              {parseInt(d)}
            </option>
          ))}
        </select>
        <select className={`${style.month} outline`} name='month' value={month} onChange={handleMonthChange}>
          <option value='' disabled hidden>
            Месяц
          </option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select className={`${style.year} outline`} name='year' value={year} onChange={handleYearChange}>
          <option value='' disabled hidden>
            Год
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {validationError && <div className='error'>{validationError}</div>}
      {!validationError && info && <div className='info'>{info}</div>}
    </div>
  )
}
