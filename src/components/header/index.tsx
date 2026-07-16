import style from './header.module.scss'
import { Link, NavLink, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { useModalContext } from '../../services/ModalContext'
import { useClickOutside, useHorizontalScroll } from '../../hooks/hooks'
import { GROUPS_MAP } from '../../utils/date'
import IconSprite from '../../elements/icon'
import ivanga from '../../assets/ivanga.png'
import ivangaW from '../../assets/ivanga_w.png'
import UserMenu from '../user'
import ModalHow from '../../modals/how'
import PredictionSearch from '../search'

export default function Header() {
  const { user } = useAppSelector((state) => state.auth)
  const { theme } = useAppSelector((state) => state.app)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('order') || 'top'
  const { openModal } = useModalContext()
  const [filterRef, isFilterOpen, toggleFilter] = useClickOutside()
  const scrollRef = useHorizontalScroll(true)

  const handleF = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newFilter = e.currentTarget.name
    if (newFilter === 'top') {
      searchParams.delete('order')
    } else {
      searchParams.set('order', newFilter)
    }
    setSearchParams(searchParams)
    toggleFilter()
  }

  return (
    <header>
      <div className={style.wrapper}>
        <div className={style.head}>
          <Link className={style.logo} to='/'>
            {/* <Logo /> */}
            {/* <h2>iVanga</h2> */}
            <img src={theme === 'dark' ? ivanga : ivangaW} alt='iVanga' />
          </Link>
          <div className='row center gap20 grow'>
            <PredictionSearch />
            {!user && (
              <button className={style.tultip} onClick={() => openModal(ModalHow)}>
                <IconSprite name='tultip' size={14} />
                <span>Как это работает?</span>
              </button>
            )}
          </div>
          <UserMenu />
        </div>
        <nav>
          <div className={style.filters} ref={filterRef}>
            <button className={style.btn} onClick={toggleFilter}>
              <IconSprite name='filter' />
            </button>
            <div className={`${style.dropdown} ${isFilterOpen ? style.open : ''}`}>
              <button className={`${style.item} ${filter === 'top' ? 'active' : ''}`} name='top' onClick={handleF}>
                <IconSprite name='trend' size={16} />
                <span>Топ</span>
              </button>
              <button
                className={`${style.item} ${filter === 'volume' ? 'active' : ''}`}
                name='volume'
                onClick={handleF}>
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
              <button
                className={`${style.item} ${filter === 'finish' ? 'active' : ''}`}
                name='finish'
                onClick={handleF}>
                <IconSprite name='finish' size={16} />
                <span>Финиш</span>
              </button>
            </div>
          </div>
          <div className='hr' />
          <div className='row center justify gap-2 w-full noscroll-x transition' ref={scrollRef}>
            {Object.entries(GROUPS_MAP).map(([path, title]) => {
              const basePath = path === '' ? '/' : `/${path}`
              return (
                <NavLink
                  key={path}
                  to={{
                    pathname: basePath,
                    search: searchParams.toString(),
                  }}
                  className={style.item}>
                  {title}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
