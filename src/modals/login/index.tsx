import style from './login.module.scss'
import { useState } from 'react'
// import { AppContext } from '../../context/application/appContext'

export default function ModalLogin() {
  const [disabled, setDisabled] = useState(false)
  // const { authNetwork } = useContext(AppContext)

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDisabled(true)
    console.log(e.currentTarget.name)

    // authNetwork(e.currentTarget.name)
  }

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Login with</h1>
      <button className='btn green' name='google' onClick={handleLogin} disabled={disabled}>
        Google
      </button>
      <button className='btn blue' name='telegram' onClick={handleLogin} disabled={disabled}>
        Telegram
      </button>
    </div>
  )
}
