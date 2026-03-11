import style from './footer.module.scss'
import Icon from '../../elements/icon/Icon'
import Logo from '../header/logo'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className='column start gap8'>
          <a href='/' className={style.logo}>
            <Logo />
            <h1>iVanga</h1>
          </a>
          <h3>Самый большой сервис предсказаний в России™</h3>
        </div>

        <hr />

        <div className='column gap20'>
          <div className={style.bottom}>
            <div className={style.socials}>
              <a href='mailto:hello@ivanga.me' target='_blank' rel='noreferrer'>
                <Icon name='mail' size={20} />
              </a>
              <a href='https://twitter.com/ivanga' target='_blank' rel='noreferrer'>
                <Icon name='twitter' size={20} />
              </a>
              <a href='https://instagram.com/ivanga' target='_blank' rel='noreferrer'>
                <Icon name='instagram' size={20} />
              </a>
              <a href='https://discord.gg/ivanga' target='_blank' rel='noreferrer'>
                <Icon name='discord' size={20} />
              </a>
              <a href='https://tiktok.com/@ivanga' target='_blank' rel='noreferrer'>
                <Icon name='tiktok' size={20} />
              </a>
            </div>

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
              iVanga работает по всему миру через отдельные юридические лица. <a href='/us'>iVanga</a> управляется
              Unknown Origin Ltd. iVanga, a CFTC-regulated Designated Contract Market. Эта международная платформа не
              регулируется CFTC и работает независимо. Торговля сопряжена со значительным риском убытков. Ознакомьтесь с
              нашими&nbsp;
              <a href='/terms'>Условиями&nbsp;использования</a> &{' '}
              <a href='/privacy'>Политикой&nbsp;конфиденциальности</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
