import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useOauthLoginMutation } from '../../services/api'
import Empty from '../../elements/empty'

export default function OAuthCallback() {
  const { provider } = useParams<{ provider: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [oauthLogin] = useOauthLoginMutation()

  const [error, setError] = useState<string | null>(null)
  const calledRef = useRef(false)

  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (calledRef.current) return

    if (errorParam) {
      setError(`Ошибка авторизации: ${errorParam}`)
      return
    }

    if (!provider || !code) {
      navigate('/', { replace: true })
      return
    }

    calledRef.current = true

    // Извлекаем целевую страницу returnTo
    let returnTo = '/'
    if (stateParam) {
      try {
        const decoded = decodeURIComponent(escape(atob(stateParam)))
        const parsed = JSON.parse(decoded)
        if (parsed && typeof parsed.returnTo === 'string' && parsed.returnTo.startsWith('/')) {
          returnTo = parsed.returnTo
        }
      } catch {
        returnTo = sessionStorage.getItem('oauth_return_to') || '/'
      }
    }

    if (returnTo === '/') returnTo = sessionStorage.getItem('oauth_return_to') || '/'

    sessionStorage.removeItem('oauth_return_to')
    sessionStorage.removeItem('oauth_state')

    // Redirect URI должен совпадать с тем, что отправлялся в Google
    const redirectUri = `${window.location.origin}/oauth/${provider}`

    oauthLogin({ provider, code, redirect_uri: redirectUri })
      .unwrap()
      .then(() => {
        navigate(returnTo, { replace: true })
      })
      .catch((err: any) => {
        const detail = err?.data?.detail || 'Не удалось войти через сервис авторизации'
        setError(detail)
      })
  }, [provider, code, stateParam, errorParam, navigate, oauthLogin])

  return (
    <div className='container main' style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error ? (
        <div className='column center gap-4 text-center'>
          <Empty title={error} icon='warning' size={32} />
          <Link to='/' className='btn blue'>
            Вернуться на главную
          </Link>
        </div>
      ) : (
        <Empty title={`Вход через ${provider ? provider.toUpperCase() : 'OAuth'}...`} loading={true} size={32} />
      )}
    </div>
  )
}
