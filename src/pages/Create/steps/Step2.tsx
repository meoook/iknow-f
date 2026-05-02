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
        Дата, когда произойдет событие или когда станет известен результат. В этот день (12:00 UTC) прогноз перейдет в
        стадию дискуссии.
      </div>

      <DateSelect
        title='Закрытие ставок (опционально)'
        value={formData.bet_date}
        onChange={(date) => handleDateChange('bet_date', date)}
        error={errors.bet_date}
      />

      <div className={s.info}>
        По умолчанию прием ставок закрывается за день до события (12:00 UTC). Если хотите закрыть прием ставок раньше,
        укажите это здесь.
      </div>
    </>
  )
}
