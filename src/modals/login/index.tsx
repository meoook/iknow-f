import style from './login.module.scss'
import { useState } from 'react'
import { useEmailNonceMutation, useEmailAuthMutation, useW3authMutation, useW3nonceMutation } from '../../services/api'
import { web3AuthService } from '../../services/web3Auth'
import IconSprite from '../../elements/icon/Icon'
import { EMAIL_REGEX } from '../../config/config'
import Nonce from '../../elements/nonce'

interface ModalLoginProps {
  close: () => void
}

export default function ModalLogin({ close }: ModalLoginProps) {
  const NONCE_LENGTH: number = 6
  const initialEmail = localStorage.getItem('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [emailValid, setEmailValid] = useState(EMAIL_REGEX.test(initialEmail))
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'nonce'>('email')
  const [nonce, setNonce] = useState<string>('')

  const [emailNonce, { isLoading: isOauthLoading }] = useEmailNonceMutation()
  const [emailAuth, { isLoading: isEmailLoading }] = useEmailAuthMutation()
  const [w3auth, { isLoading: isWeb3Loading }] = useW3authMutation()
  const [w3nonce] = useW3nonceMutation()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValid(EMAIL_REGEX.test(e.target.value))
    setEmail(e.target.value)
  }

  const handleEmailLogin = async () => {
    setError('')
    try {
      await emailNonce({ email }).unwrap()
      localStorage.setItem('email', email)
      setStep('nonce')
    } catch (err: any) {
      setError(err.data?.message || 'Ошибка входа')
    }
  }

  const handleNonceLogin = async () => {
    if (nonce.length !== NONCE_LENGTH) {
      setError('Введите код')
      return
    }
    setError('')
    try {
      await emailAuth({ email, nonce })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err.data?.message || 'Неверный код')
    }
  }

  const handleWeb3Login = async (type: 'metamask' | 'phantom') => {
    setError('')
    try {
      const { signature, message } = await web3AuthService.authenticateWithWeb3(w3nonce, type)
      await w3auth({ message, signature })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err.message || 'Web3 login failed')
    }
  }

  const stepBack = () => {
    setStep('email')
    setNonce('')
  }

  return (
    <div className={style.wrapper}>
      <h1 className='column center'>Добро пожаловать в Vanga</h1>
      {error && <div className='login-error'>{error}</div>}

      <div className={style.steps} style={{ gridTemplateRows: step === 'email' ? '1fr 0fr' : '0fr 1fr' }}>
        <div className={style.stepItem}>
          <div className='column gap20'>
            <button disabled={isOauthLoading} className='btn blue big'>
              <IconSprite name='vk' size={28} />
              <span>Войти с VK ID</span>
            </button>

            <div className='row center gap20'>
              <hr className='grow' />
              <span>ИЛИ</span>
              <hr className='grow' />
            </div>

            <div className={style.email}>
              <input
                name='email'
                type='email'
                value={email}
                onChange={handleEmailChange}
                placeholder='Почтовый адрес'
              />
              <button
                type='submit'
                className='btn blue'
                disabled={!emailValid || isOauthLoading}
                onClick={handleEmailLogin}>
                Продолжить
              </button>
            </div>

            <div className='row center gap20'>
              <button
                onClick={() => handleWeb3Login('metamask')}
                disabled={isWeb3Loading}
                className='btn gray grow big'>
                <IconSprite name='metamask' size={28} />
                Metamask
              </button>
              <button onClick={() => handleWeb3Login('phantom')} disabled={isWeb3Loading} className='btn gray grow big'>
                <IconSprite name='phantom' size={28} />
                Phantom
              </button>
            </div>
          </div>
        </div>

        <div className={style.stepItem}>
          <div className='column center gap12'>
            <div className='column center gap8'>
              <h2>Введите код</h2>
              <p className='color-gray'>{`Мы отправили ${NONCE_LENGTH}-значный код на ${email}`}</p>
            </div>

            <Nonce length={NONCE_LENGTH} value={nonce} onChange={setNonce} />

            <button
              className='btn blue big w100'
              disabled={nonce.length !== NONCE_LENGTH || isEmailLoading}
              onClick={handleNonceLogin}>
              Подтвердить
            </button>

            <button className='btn text' onClick={stepBack}>
              Изменить почту
            </button>
          </div>
        </div>
      </div>

      <small className='column center color-gray'>Условия использования</small>
    </div>
  )
}
