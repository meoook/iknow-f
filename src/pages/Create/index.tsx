import s from './wizard.module.scss'
import { WizardProvider } from './WizardProvider'
import { useWizard } from './WizardContext'
import { WizardHeader } from './components/header'
import { WizardFooter } from './components/footer'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'

const WizardContent = () => {
  const { step } = useWizard()

  return (
    <div className={s.container}>
      <WizardHeader />

      <div className={s.content}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </div>

      <WizardFooter />
    </div>
  )
}

export default function PageCreateRequest() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
