import s from '../wizard.module.scss'
import IconSprite from '../../../elements/icon'
import TradeInput from '../../../elements/trade-input/TradeInput'
import { useAppSelector } from '../../../hooks/useRedux'
import { useWizard } from '../WizardContext'

export const Step3 = () => {
  const user = useAppSelector((state) => state.auth.user)
  const { settings } = useAppSelector((state) => state.app)
  const {
    formData,
    errors,
    choiceInput,
    activeTab,
    isTilt,
    setFormData,
    setChoiceInput,
    handleAddChoice,
    handleRemoveChoice,
    handleTabChange,
    tilt,
    VOTE_YES_NAME,
    VOTE_NO_NAME,
  } = useWizard()

  return (
    <div className='column gap-4'>
      <div className={s.card}>
        <div className='row gap-4 bd-b mb-4'>
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
                value={choiceInput}
                onChange={(e) => setChoiceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChoice()}
                className='outline'
                placeholder='Добавить вариант'
              />
              <button className='btn blue' onClick={handleAddChoice} type='button'>
                <IconSprite name='plus' size={24} />
              </button>
            </div>
            <div className='column gap-2'>
              {formData.choices.map((choice) => (
                <div
                  key={choice}
                  className={`${s.item}${formData.vote === choice ? ' active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, vote: choice }))}>
                  <div className={s.bullet} />
                  <span className='truncate grow'>{choice}</span>
                  <button
                    className={s.remove}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveChoice(choice)
                    }}
                    type='button'>
                    <IconSprite name='close' size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='row center gap-3'>
            <button
              className={`btn big w-full ${formData.vote === VOTE_YES_NAME ? 'green' : 'gray'}`}
              onClick={() => setFormData((prev) => ({ ...prev, vote: VOTE_YES_NAME }))}
              type='button'>
              Сбудется
            </button>
            <button
              className={`btn big w-full ${formData.vote === VOTE_NO_NAME ? 'red' : 'gray'}`}
              onClick={() => setFormData((prev) => ({ ...prev, vote: VOTE_NO_NAME }))}
              type='button'>
              Не сбудется
            </button>
          </div>
        )}
        {errors.choices && (
          <div className='row center alert-orange gap-1 ph-3 pv-2 bdr text-sm'>
            <IconSprite name='warning' size={20} />
            <span className='truncate'>{errors.choices}</span>
          </div>
        )}
      </div>

      <div className={s.info}>
        Выберите тип ответа: простой "Да/Нет" или список ваших вариантов. Не забудьте выбрать тот вариант, на который
        ставите вы сами.
      </div>

      <div className='column gap-4'>
        <h2 className='pv-2 bd-b'>Ставка</h2>
        <TradeInput
          value={formData.amount}
          setValue={(v) => setFormData((prev) => ({ ...prev, amount: v }))}
          minimum={settings.min_create}
          maximum={user?.balance ? Math.floor(user.balance) : 0}
          isTilt={isTilt}
          tilt={tilt}
        />
        {errors.amount && (
          <div className='row center alert-orange gap-1 ph-3 pv-2 bdr text-sm'>
            <IconSprite name='warning' size={20} />
            <span className='truncate'>{errors.amount}</span>
          </div>
        )}
      </div>

      <div className={s.info}>
        Минимальная ставка для создания прогноза: <b>${settings.min_create}</b>. Ваша ставка подтверждает вашу
        уверенность в результате.
      </div>
    </div>
  )
}
