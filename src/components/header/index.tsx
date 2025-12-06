import style from './header.module.scss'
import { Link } from 'react-router-dom'
import LoaderCar from '../../elements/loader-car'
import { useGetUserQuery, useSingOutMutation } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux'
import IconSprite from '../../elements/icon/Icon'

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
      <header className={style.header}>
        <nav>
          <div className={style.logo}>
            <Link className={style.link} to='/'>
              <IconSprite name='arrow_down' />
              <h2>iKnow</h2>
            </Link>
          </div>
          <div className={style.search}>
            <div className={style.input}>
              <input name='search' placeholder='Search' />
              <div className='row'>
                <IconSprite name='arrow_down' />
                <span>Как это работает?</span>
              </div>
              {/* <button className={style.btn} disabled>
              {iconArray.search}
            </button> */}
            </div>
          </div>
          <div className={style.menu}>
            {/* <button className={style.theme} onClick={toggleTheme}>
            {dark ? iconArray.sun : iconArray.moon}
          </button> */}
            {user ? (
              // <UserMenu user={user} />
              <></>
            ) : (
              <Link className='btn blue' to='/login'>
                Sign Up
              </Link>
            )}
          </div>
        </nav>
      </header>
    </>
  )
}
