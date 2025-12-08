import style from './header.module.scss'
import { Link, NavLink } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useGetUserQuery, useSingOutMutation } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import IconSprite from '../../elements/icon/Icon'
import LoaderCar from '../../elements/loader-car'
import Logo from './logo'

export default function Header() {
  const navigate = useNavigate()
  // const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const { token, loading } = useAppSelector((state) => state.auth)
  const [signOut, { isLoading }] = useSingOutMutation()
  const { data: user } = useGetUserQuery(undefined, { skip: !Boolean(token) || isLoading })

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [filter, setFilter] = useState('top')
  const closeTimeoutRef = useRef<number | null>(null)

  const logOut = () => {
    navigate('/', { replace: true })
    signOut()
  }

  const handleF = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilter(e.currentTarget.name)
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsMenuOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false)
    }, 300)
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
            {user ? (
              // <UserMenu user={user} />
              <></>
            ) : (
              <Link className='btn blue' to='/login'>
                Войти
              </Link>
            )}
            <div className={style.menuContainer} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className='btn btn-icon'>
                <IconSprite name='menu' />
              </button>
              {isMenuOpen && (
                <div className={style.dropdown}>
                  <button className={style.item}>
                    <IconSprite name='crown' size={20} color='var(--color-brand)' />
                    <span>Таблица лидеров</span>
                  </button>
                  <button className={style.item}>
                    <IconSprite name='activity' size={20} color='var(--color-red)' />
                    <span>Активность</span>
                  </button>
                  <button className={style.item} onClick={toggleTheme}>
                    <IconSprite name='moon' size={20} color='var(--color-blue)' />
                    {isDarkTheme ? 'Светлая тема' : 'Темная тема'}
                  </button>
                  <hr />
                  <a className={style.link} href='/terms'>
                    Условия использования
                  </a>
                  <a className={style.link} href='/about'>
                    О приложении
                  </a>
                  <a className={style.link} href='/docs'>
                    Документация
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <nav>
          <div className='row center gap12'>
            <button className={`${style.item} ${filter === 'top' ? 'active' : ''}`} name='top' onClick={handleF}>
              <IconSprite name='trend' size={16} />
              <span>Топ</span>
            </button>
            <button className={`${style.item} ${filter === 'volume' ? 'active' : ''}`} name='volume' onClick={handleF}>
              <IconSprite name='volume' size={16} />
              <span>Объем</span>
            </button>
            <button className={`${style.item} ${filter === 'diff' ? 'active' : ''}`} name='diff' onClick={handleF}>
              <IconSprite name='diff' size={16} />
              <span>Разница</span>
            </button>
            <button className={`${style.item} ${filter === 'star' ? 'active' : ''}`} name='star' onClick={handleF}>
              <IconSprite name='star' size={16} />
              <span>Новые</span>
            </button>
            <button className={`${style.item} ${filter === 'finish' ? 'active' : ''}`} name='finish' onClick={handleF}>
              <IconSprite name='finish' size={16} />
              <span>Финиш</span>
            </button>
          </div>
          <div className='hr' />
          <div className='row center gap12 w100'>
            <NavLink to='/' className={style.item}>
              Все
            </NavLink>
            <NavLink to='/politics' className={style.item}>
              Политика
            </NavLink>
            <NavLink to='/sport' className={style.item}>
              Спорт
            </NavLink>
            <NavLink to='/finance' className={style.item}>
              Финансы
            </NavLink>
            <NavLink to='/crypto' className={style.item}>
              Крипта
            </NavLink>
            <NavLink to='/geopolitics' className={style.item}>
              Геополитика
            </NavLink>
            <NavLink to='/technology' className={style.item}>
              Технологии
            </NavLink>
            <NavLink to='/culture' className={style.item}>
              Культура
            </NavLink>
            <NavLink to='/world' className={style.item}>
              Мир
            </NavLink>
            <NavLink to='/economy' className={style.item}>
              Экономика
            </NavLink>
            <NavLink to='/elections' className={style.item}>
              Выборы
            </NavLink>
            <NavLink to='/mentions' className={style.item}>
              Упоминания
            </NavLink>
            {/* <NavLink to='/other' className={style.item}>
              Другие
            </NavLink> */}
          </div>
        </nav>
      </header>
    </>
  )
}
