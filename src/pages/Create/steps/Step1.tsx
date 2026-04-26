import s from '../wizard.module.scss'
import { useWizard } from '../WizardContext'

export const Step1 = () => {
  const { formData, errors, handleInputChange } = useWizard()

  return (
    <>
      <div className='form-row'>
        <label htmlFor='title'>Название прогноза</label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title}
          onChange={handleInputChange}
          className={errors.title ? 'outline error' : 'outline'}
          placeholder='Курс BTC будет выше $100k к концу года'
        />
        {errors.title && <div className='error'>{errors.title}</div>}
      </div>

      <div className={s.info}>
        Придумайте короткое и понятное название. Оно может быть в форме вопроса или утверждения.
      </div>

      <div className='form-row'>
        <label htmlFor='rules'>Условия и правила расчета</label>
        <textarea
          id='rules'
          name='rules'
          value={formData.rules}
          onChange={handleInputChange}
          className={errors.rules ? 'outline error' : 'outline'}
          placeholder='Опишите, как именно будет определяться результат...'
        />
        {errors.rules && <div className='error'>{errors.rules}</div>}
      </div>

      <div className={s.info}>
        Укажите критерии, по которым прогноз считается сбывшимся. Избегайте двусмысленности, чтобы участники одинаково
        понимали результат.
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
          placeholder='https://...'
        />
        {errors.link && <div className='error'>{errors.link}</div>}
      </div>

      <div className={s.info}>
        Добавление ссылки повышает доверие к вашему прогнозу. Разные источники могут по разному трактовать события, что
        может привести к неоднозначности в результатах прогноза. Во избежании таких случаев укажите источник на который
        стоит ссылаться при подведении итогов.
      </div>
    </>
  )
}
