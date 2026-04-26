import { createContext, useContext } from 'react'
import type { IRequestCreate } from '../../types/app.types'

export interface IWizardContext {
  step: number
  formData: IRequestCreate
  errors: Record<string, string>
  error: string
  choiceInput: string
  activeTab: 'yesno' | 'choices'
  isTilt: boolean
  isLoading: boolean

  setStep: (step: number | ((s: number) => number)) => void
  setFormData: (data: IRequestCreate | ((prev: IRequestCreate) => IRequestCreate)) => void
  setChoiceInput: (value: string) => void
  setActiveTab: (tab: 'yesno' | 'choices') => void

  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleDateChange: (name: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
  handleAddChoice: () => void
  handleRemoveChoice: (choice: string) => void
  handleTabChange: (tab: 'yesno' | 'choices') => void
  handleCreate: () => void
  tilt: () => void

  VOTE_YES_NAME: string
  VOTE_NO_NAME: string
}

export const WizardContext = createContext<IWizardContext | undefined>(undefined)

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) throw new Error('useWizard must be used within a WizardProvider')
  return context
}
