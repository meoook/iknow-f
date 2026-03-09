import style from './how.module.scss'
import { useEffect } from 'react'

import { useModalContext } from '../../services/ModalContext'

export default function ModalHow() {
  const { setCloseOutside } = useModalContext()

  useEffect(() => {
    setCloseOutside(true)
  }, [setCloseOutside])

  return (
    <div className={`${style.wrapper} noscroll`}>
      <Step1 />
    </div>
  )
}

function Step1() {
  return (
    <>
      <h1>1. Pick a Polymarket</h1>
      <div>
        Buy 'Yes' or 'No' shares depending on your prediction. Buying shares is like betting on the outcome. Odds shift
        in real time as other traders bet.
      </div>
    </>
  )
}
