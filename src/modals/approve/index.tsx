import style from './approve.module.scss'
import { useState } from 'react'
import { useEmailApproveMutation } from '../../services/api'
import Nonce from '../../elements/nonce'

interface ModalApproveProps {
  email: string
  close: () => void
}

export default function ModalApprove({ email, close }: ModalApproveProps) {
  const NONCE_LENGTH: number = 6
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState<string>('')

  const [emailApprove, { isLoading: isEmailLoading }] = useEmailApproveMutation()

  const handleApprove = async () => {
    if (nonce.length !== NONCE_LENGTH) {
      setError('Введите код')
      return
    }
    setError('')
    try {
      await emailApprove({ email, nonce })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err || 'Неверный код')
    }
  }

  return (
    <div className={style.wrapper}>
      <h1>Введите код</h1>

      <div className='column center gap4'>
        <p className='color-gray'>{`Мы отправили ${NONCE_LENGTH}-значный код на ${email}`}</p>
        <div>&nbsp;</div>
        <Nonce length={NONCE_LENGTH} value={nonce} onChange={setNonce} />
        <div className='flex-i center middle text-red'>{error ? error : <>&nbsp;</>}</div>

        <button
          className='btn blue big w-full'
          disabled={nonce.length !== NONCE_LENGTH || isEmailLoading}
          onClick={handleApprove}>
          Подтвердить
        </button>
      </div>

      <small className='column center color-gray'>Условия использования</small>
    </div>
  )
}
