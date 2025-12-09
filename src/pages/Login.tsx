import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignInMutation, useW3authMutation, useW3nonceMutation } from '../services/api'
import { web3AuthService } from '../services/web3Auth'
import './Login.scss'

export const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [signIn, { isLoading: isPasswordLoading }] = useSignInMutation()
  const [w3auth, { isLoading: isWeb3Loading }] = useW3authMutation()
  const [w3nonce] = useW3nonceMutation()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn({ email, password }).unwrap()
      navigate('/')
    } catch (err: any) {
      setError(err.data?.message || 'Login failed')
    }
  }

  const handleWeb3Login = async () => {
    setError('')

    try {
      const { signature, message } = await web3AuthService.authenticateWithWeb3(w3nonce)
      await w3auth({ message, signature }).unwrap()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Web3 login failed')
    }
  }

  return (
    <div className='login-page'>
      <div className='login-container'>
        <h1 className='login-title'>Welcome to iKnow</h1>

        {error && <div className='login-error'>{error}</div>}

        <div className='login-web3'>
          <button onClick={handleWeb3Login} disabled={isWeb3Loading} className='web3-button'>
            {isWeb3Loading ? 'Connecting...' : '🦊 Connect Wallet'}
          </button>
        </div>

        <div className='login-divider'>
          <span>OR</span>
        </div>

        <form onSubmit={handlePasswordLogin} className='login-form'>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>

          <button type='submit' disabled={isPasswordLoading} className='login-button'>
            {isPasswordLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
