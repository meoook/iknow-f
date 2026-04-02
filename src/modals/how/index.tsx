import style from './how.module.scss'
import { useEffect, useState } from 'react'
import { useModalContext } from '../../services/ModalContext'
import ModalLogin from '../login'
import how1 from '../../assets/how1.webp'
import how2 from '../../assets/how2.webp'
import how3 from '../../assets/how3.webp'

const stepsData = [
  {
    img: how1,
    title: '1. Выбери карточку предсказания',
    text: 'Купи доли «Да» или «Нет» в зависимости от своих прогнозов. Коэффициенты меняются в режиме реального времени по мере того, как другие участники рынка торгуют.',
    btnText: 'Далее',
  },
  {
    img: how2,
    title: '2. Сделай ставку',
    text: 'Пополни счет с помощью криптовалюты, дебетовой карты или банковского перевода — и начинай торговать.',
    btnText: 'Далее',
  },
  {
    img: how3,
    title: '3. Погашение',
    text: 'Продай свои доли «Да» или «Нет» в любое время или дождись окончания рынка, чтобы погасить выигрышные доли и получить по 1 доллару США за штуку. Создай учетную запись и размести свою первую сделку за считанные минуты.',
    btnText: 'Начать',
  },
]

export default function ModalHow() {
  const { setCloseOutside, openModal, closeModal } = useModalContext()
  const [step, setStep] = useState(0)

  useEffect(() => {
    setCloseOutside(true)
  }, [setCloseOutside])

  const handleNext = () => {
    if (step < stepsData.length - 1) {
      setStep((prev) => prev + 1)
    } else {
      openModal(ModalLogin, 'common', { close: closeModal })
    }
  }

  const currentStep = stepsData[step]

  return (
    <div className={`${style.wrapper} noscroll`}>
      <img src={currentStep.img} alt={`how${step + 1}`} />
      <h2>{currentStep.title}</h2>
      <div>{currentStep.text}</div>
      <button className='btn blue big' onClick={handleNext}>
        {currentStep.btnText}
      </button>
    </div>
  )
}
