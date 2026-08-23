import style from './footer.module.scss'
import Logo from '../header/logo'
import { Link } from 'react-router-dom'
import Socials from '../../elements/menu/socials'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className='column start gap-2'>
          <Link to='/' className={style.logo}>
            <Logo />
            <h1>iVanga</h1>
          </Link>
          <h3>Самый большой сервис предсказаний в России™</h3>
        </div>

        <hr />

        <div className='column gap-5'>
          <div className={style.bottom}>
            <Socials />

            <div className={style.links}>
              <span>Unknown Origin Ltd. © {currentYear}</span>
              <span className={style.dot}>·</span>
              <Link to='/privacy'>Конфиденциальность</Link>
              <span className={style.dot}>·</span>
              <Link to='/tos'>Условия использования</Link>
              <span className={style.dot}>·</span>
              <Link to='/help'>Центр помощи</Link>
              <span className={style.dot}>·</span>
              <Link to='/docs'>Документация</Link>
            </div>
            <div />
          </div>

          <div className={style.about}>
            <p>
              iVanga работает по всему миру через отдельные юридические лица. <Link to='/us'>iVanga</Link> управляется
              Unknown Origin Ltd. iVanga, a CFTC-regulated Designated Contract Market. Эта международная платформа не
              регулируется CFTC и работает независимо. Торговля сопряжена со значительным риском убытков. Ознакомьтесь с
              нашими&nbsp;
              <Link to='/tos'>Условиями&nbsp;использования</Link> &{' '}
              <Link to='/privacy'>Политикой&nbsp;конфиденциальности</Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
