import style from './datepicker.module.scss'
import { useState } from 'react'
import { useClickOutside } from '../../hooks/hooks'
import IconSprite from '../../elements/icon/Icon'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  minDate?: string
  error?: boolean
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  minDate,
  error,
}: DatePickerProps) {
  const [calendarRef, isOpen, toggle] = useClickOutside()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() || 7 // Понедельник = 1, Воскресенье = 7

    const days: (number | null)[] = []

    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 1; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Форматируем дату в локальном часовом поясе, избегая проблем с UTC
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // Проверка минимальной даты
    if (minDate && formattedDate < minDate) return

    onChange(formattedDate)
    // Закрываем календарь после выбора даты (вызываем toggle как обработчик события)
    setTimeout(() => toggle({} as React.MouseEvent), 0)
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isDateDisabled = (day: number | null) => {
    if (!day || !minDate) return false
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return dateStr < minDate
  }

  const isSelectedDate = (day: number | null) => {
    if (!day || !value) return false
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return dateStr === value
  }

  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  return (
    <div className={style.container} ref={calendarRef}>
      <div className={`${style.input} ${error ? 'error' : ''}`} onClick={toggle}>
        <span className={value ? '' : style.placeholder}>{value ? formatDate(value) : placeholder}</span>
        <IconSprite name='arrow_down' size={16} />
      </div>

      {isOpen && (
        <div className={style.calendar}>
          <div className={style.header}>
            <button type='button' onClick={handlePrevMonth} className={style.navBtn}>
              <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
                <IconSprite name='arrow_down' size={20} />
              </span>
            </button>
            <span className={style.monthName}>{monthName}</span>
            <button type='button' onClick={handleNextMonth} className={style.navBtn}>
              <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>
                <IconSprite name='arrow_down' size={20} />
              </span>
            </button>
          </div>

          <div className={style.weekdays}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className={style.weekday}>
                {day}
              </div>
            ))}
          </div>

          <div className={style.days}>
            {getDaysInMonth(currentMonth).map((day, index) => (
              <button
                key={index}
                type='button'
                className={`${style.day} ${!day ? style.empty : ''} ${isSelectedDate(day) ? style.selected : ''} ${
                  isDateDisabled(day) ? style.disabled : ''
                }`}
                onClick={() => day && !isDateDisabled(day) && handleDateClick(day)}
                disabled={!day || isDateDisabled(day)}>
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
