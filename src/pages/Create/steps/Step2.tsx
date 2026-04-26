import s from '../wizard.module.scss'
import DateSelect from '../../../elements/dateselect'
import { useWizard } from '../WizardContext'

export const Step2 = () => {
  const { formData, errors, handleDateChange } = useWizard()

  return (
    <>
      <DateSelect
        title='Дата события'
        value={formData.end_date}
        onChange={(date) => handleDateChange('end_date', date)}
        error={errors.end_date}
      />

      <div className={s.info}>
        Дата, когда произойдет событие или когда станет известен результат. За день до этой даты прогноз перейдет в
        стадию ожидания результата.
      </div>

      <DateSelect
        title='Закрытие ставок (опционально)'
        value={formData.bet_date}
        onChange={(date) => handleDateChange('bet_date', date)}
        error={errors.bet_date}
      />

      <div className={s.info}>
        Если вы хотите закрыть прием ставок раньше даты самого события, укажите это здесь. По умолчанию ставки
        закрываются за день до события.
      </div>
    </>
  )
}
