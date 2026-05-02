import { useAppSelector } from '../../hooks/useRedux'
import style from './dateselect.module.scss'
import { useState, useEffect, useMemo } from 'react'

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
  value: string
  onChange: (date: string) => void
  error?: string
}

export default function DateSelect({ title, value, onChange, error }: DateSelectProps) {
  const getInitial = (val: string) => {
    const [y, m, d] = (val || '').split('-')
    return {
      y: y || '',
      m: m ? m.padStart(2, '0') : '',
      d: d ? d.padStart(2, '0') : '',
    }
  }

  const [month, setMonth] = useState(() => getInitial(value).m)
  const [day, setDay] = useState(() => getInitial(value).d)
  const [year, setYear] = useState(() => getInitial(value).y)
  const { limit } = useAppSelector((state) => state.app.settings)

  // Парсим value при изменении (синхронизация сверху)
  useEffect(() => {
    const { y, m, d } = getInitial(value)
    if (y !== year || m !== month || d !== day) {
      setYear(y)
      setMonth(m)
      setDay(d)
    }
  }, [value])

  // Обновление родительского компонента при изменении полей
  useEffect(() => {
    if (month && day && year) {
      const formattedDate = `${year}-${month}-${day}`
      // Вызываем onChange только если дата реально изменилась по сравнению с value
      if (formattedDate !== value) {
        onChange(formattedDate)
      }
    } else if (value) {
      // Если поля очищены, но value еще есть
      onChange('')
    }
  }, [month, day, year, value, onChange])

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

  const years = useMemo(() => {
    const curYear = new Date().getFullYear()
    const list = []
    for (let i = curYear; i <= curYear + limit; i++) {
      list.push(i.toString())
    }
    return list
  }, [])

  const daysList = useMemo(() => {
    const maxDays = getDaysInMonth(month, year)
    return Array.from({ length: maxDays }, (_, i) => (i + 1).toString().padStart(2, '0'))
  }, [month, year])

  return (
    <div className='form-row'>
      {title && <div>{title}</div>}
      <div className={`${style.container} ${error ? style.error : ''}`}>
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
      {error && <div className='error'>{error}</div>}
    </div>
  )
}
