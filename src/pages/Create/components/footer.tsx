import s from '../wizard.module.scss'
import { useWizard } from '../WizardContext'
import IconSprite from '../../../elements/icon'
import Loader from '../../../elements/loader'

export const WizardFooter = () => {
  const { step, isLoading, error, prevStep, nextStep, handleCreate } = useWizard()

  return (
    <>
      <div className={s.footer}>
        {step > 1 && (
          <button className='btn gray mid w-full' onClick={prevStep} disabled={isLoading}>
            Назад
          </button>
        )}
        {step < 3 ? (
          <button className='btn blue mid w-full' onClick={nextStep}>
            Далее
          </button>
        ) : (
          <button className='btn blue mid w-full' onClick={handleCreate} disabled={isLoading}>
            {isLoading ? <Loader /> : 'Создать прогноз'}
          </button>
        )}
      </div>
      {error && (
        <div className='row center alert-orange gap-1 ph-3 pv-2 bdr text-sm'>
          <IconSprite name='warning' size={20} />
          {error}
        </div>
      )}
    </>
  )
}
