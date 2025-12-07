import style from './header.module.scss'
import { Link } from 'react-router-dom'
import LoaderCar from '../../elements/loader-car'
import { useGetUserQuery, useSingOutMutation } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import IconSprite from '../../elements/icon/Icon'
import Logo from './logo'
export default function Header() {
  const navigate = useNavigate()
  // const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const { token, loading } = useAppSelector((state) => state.auth)
  const [signOut, { isLoading }] = useSingOutMutation()
  const { data: user } = useGetUserQuery(undefined, { skip: !Boolean(token) || isLoading })

  const logOut = () => {
    navigate('/', { replace: true })
    signOut()
  }

  return (
    <>
      {loading && <LoaderCar />}
      <header>
        <div className={style.head}>
          <Link className={style.logo} to='/'>
            <Logo />
            <h2>iKnow</h2>
          </Link>
          <div className='row center gap w100'>
            <form className={style.input}>
              <input name='search' placeholder='Поиск' />
              <IconSprite name='search' />
            </form>
            <button className={style.tultip}>
              <IconSprite name='tultip' size={14} />
              <span>Как это работает?</span>
            </button>
          </div>
          <div className='row center gap8'>
            {/* <button className={style.theme} onClick={toggleTheme}>
            {dark ? iconArray.sun : iconArray.moon}
          </button> */}
            {user ? (
              // <UserMenu user={user} />
              <></>
            ) : (
              <Link className='btn blue' to='/login'>
                Войти
              </Link>
            )}
            <button className='btn btn-icon'>
              <IconSprite name='menu' />
            </button>
          </div>
        </div>
        <nav>
          <div className='row center gap12'>
            <button className={`row start gap2 ${style.active}`}>
              <IconSprite name='trend' size={16} />
              <span>Топ</span>
            </button>
            <button className='row start gap2'>
              <IconSprite name='volume' size={16} />
              <span>Объем</span>
            </button>
            <button className='row start gap2'>
              <IconSprite name='diff' size={16} />
              <span>Разница</span>
            </button>
            <button className='row start gap2'>
              <IconSprite name='star' size={16} />
              <span>Новые</span>
            </button>
            <button className='row start gap2'>
              <IconSprite name='finish' size={16} />
              <span>Финиш</span>
            </button>
          </div>
          <div className='hr' />
          <div className='row center gap12 w100'>
            <button>Политика</button>
            <button>Спорт</button>
            <button>Финансы</button>
            <button>Крипта</button>
            <button className={style.active}>Геополитика</button>
            <button>Технологии</button>
            <button>Культура</button>
            <button>Мир</button>
            <button>Экономика</button>
            <button>Выборы</button>
            <button>Упоминания</button>
            <button>Другие</button>
          </div>
        </nav>
      </header>
    </>
  )
}
