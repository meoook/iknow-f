import style from './login.module.scss'
import { useRef, useState } from 'react'
import { useEmailNonceMutation, useEmailAuthMutation, useW3authMutation, useW3nonceMutation } from '../../services/api'
import { web3AuthService } from '../../services/web3Auth'
import IconSprite from '../../elements/icon/Icon'
import { EMAIL_REGEX } from '../../config/config'

interface ModalLoginProps {
  close: () => void
}

export default function ModalLogin({ close }: ModalLoginProps) {
  const initialEmail = localStorage.getItem('email') || ''
  const firstInput = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState(initialEmail)
  const [emailValid, setEmailValid] = useState(EMAIL_REGEX.test(initialEmail))
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'nonce'>('email')
  const [nonce, setNonce] = useState<string[]>(['', '', '', '', '', ''])

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
      firstInput.current?.focus()
    } catch (err: any) {
      setError(err.data?.message || 'Login failed')
    }
  }

  const handleNonceChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newNonce = [...nonce]
    newNonce[index] = value.slice(-1)
    setNonce(newNonce)

    if (value && index < 5) {
      const nextInput = document.getElementById(`nonce-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !nonce[index] && index > 0) {
      const prevInput = document.getElementById(`nonce-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').trim()
    const digits = data.replace(/\D/g, '').slice(0, 6)
    if (!digits) return

    const newNonce = [...nonce]
    digits.split('').forEach((char, i) => {
      newNonce[i] = char
    })
    setNonce(newNonce)

    const nextIndex = Math.min(digits.length, 5)
    document.getElementById(`nonce-${nextIndex}`)?.focus()
  }

  const handleNonceLogin = async () => {
    setError('')
    try {
      await emailAuth({ email, nonce: nonce.join('') })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err.data?.message || 'Invalid code')
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
    setNonce(['', '', '', '', '', ''])
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
              Войти с VK ID
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
              <p className='color-gray'>Мы отправили 6-значный код на {email}</p>
            </div>

            <div className={style.nonceInputs}>
              {nonce.map((digit, i) => (
                <input
                  key={i}
                  id={`nonce-${i}`}
                  type='text'
                  inputMode='numeric'
                  value={digit}
                  onChange={(e) => handleNonceChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  className={style.nonceCell}
                  ref={i === 0 ? firstInput : undefined}
                />
              ))}
            </div>

            <button
              className='btn blue big w100'
              disabled={nonce.some((d) => !d) || isEmailLoading}
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
