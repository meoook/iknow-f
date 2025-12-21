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

export default function DateSelect({ value, onChange, error }: DateSelectProps) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')

  // Парсим value при изменении
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-')
      setYear(y || '')
      setMonth(m || '')
      setDay(d || '')
    }
  }, [value])

  // Обновляем родительский компонент при изменении любого поля
  useEffect(() => {
    if (month && day && year && year.length === 4) {
      const paddedDay = day.padStart(2, '0')
      const formattedDate = `${year}-${month}-${paddedDay}`
      onChange(formattedDate)
    }
  }, [month, day, year, onChange])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value)
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Только цифры
    if (val === '') {
      setDay('')
    } else {
      const numVal = parseInt(val)
      if (numVal >= 1 && numVal <= 31) {
        setDay(val)
      }
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Только цифры
    if (val.length <= 4) {
      setYear(val)
    }
  }

  return (
    <div className={`${style.container} ${error ? style.error : ''}`}>
      <select className={style.select} value={month} onChange={handleMonthChange}>
        <option value=''>Месяц</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <input
        type='text'
        className={style.input}
        placeholder='День'
        value={day}
        onChange={handleDayChange}
        maxLength={2}
      />

      <input
        type='text'
        className={style.input}
        placeholder='Год'
        value={year}
        onChange={handleYearChange}
        maxLength={4}
      />
    </div>
  )
}
