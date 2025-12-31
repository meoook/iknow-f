import style from './login.module.scss'
import { useState } from 'react'
import { useEmailNonceMutation, useEmailAuthMutation, useW3authMutation, useW3nonceMutation } from '../../services/api'
import { web3AuthService } from '../../services/web3Auth'
import IconSprite from '../../elements/icon/Icon'

export default function ModalLogin(closeModal: () => void) {
  const [email, setEmail] = useState(localStorage.getItem('email') || '')
  const [emailValid, setEmailValid] = useState(false)
  const [error, setError] = useState('')

  const [emailNonce, { isLoading: isOauthLoading }] = useEmailNonceMutation()
  const [emailAuth, { isLoading: isEmailLoading }] = useEmailAuthMutation()
  const [w3auth, { isLoading: isWeb3Loading }] = useW3authMutation()
  const [w3nonce] = useW3nonceMutation()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    setEmailValid(emailRegex.test(e.target.value))
    setEmail(e.target.value)
  }

  const handleEmailLogin = async () => {
    setError('')

    try {
      await emailNonce({ email }).unwrap()
      localStorage.setItem('email', email)
      closeModal()
    } catch (err: any) {
      setError(err.data?.message || 'Login failed')
    }
  }

  const handleWeb3Login = async (type: 'metamask' | 'phantom') => {
    setError('')

    try {
      const { signature, message } = await web3AuthService.authenticateWithWeb3(w3nonce, type)
      await w3auth({ message, signature }).unwrap()
      closeModal()
    } catch (err: any) {
      setError(err.message || 'Web3 login failed')
    }
  }

  return (
    <div className={style.wrapper}>
      <h1 className='column center'>Добро пожаловать в Vanga</h1>
      {error && <div className='login-error'>{error}</div>}

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
        <input name='email' type='email' value={email} onChange={handleEmailChange} placeholder='Почтовый адрес' />
        <button type='submit' className='btn blue' disabled={!emailValid} onClick={handleEmailLogin}>
          Продолжить
        </button>
      </div>

      <div className='row center gap20'>
        <button onClick={() => handleWeb3Login('metamask')} disabled={isWeb3Loading} className='btn gray grow big'>
          <IconSprite name='metamask' size={28} />
          Metamask
        </button>
        <button onClick={() => handleWeb3Login('phantom')} disabled={isWeb3Loading} className='btn gray grow big'>
          <IconSprite name='phantom' size={28} />
          Phantom
        </button>
      </div>

      <small className='column center color-gray'>Условия использования</small>
    </div>
  )
}
