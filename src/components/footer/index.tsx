import style from './footer.module.scss'
import Icon from '../../elements/icon/Icon'
import Logo from '../header/logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className='column start gap8'>
          <a href='/' className={style.logo}>
            <Logo />
            <h1>Vanga</h1>
          </a>
          <h3>Самый большой сервис предсказаний в России™</h3>
        </div>

        <hr />

        <div className={style.bottom}>
          <div className={style.left}>
            <div className={style.links}>
              <span>Unknown Origin Ltd. © {currentYear}</span>
              <span>/</span>
              <a href='/privacy'>Privacy</a>
              <span>/</span>
              <a href='/terms'>Terms of Use</a>
              <span>/</span>
              <a href='/help'>Help Center</a>
              <span>/</span>
              <a href='/docs'>Docs</a>
            </div>

            <div className={style.socials}>
              <a href='mailto:hello@i-vanga.com' target='_blank' rel='noreferrer'>
                <Icon name='mail' size={20} />
              </a>
              <a href='https://twitter.com/i-vanga' target='_blank' rel='noreferrer'>
                <Icon name='twitter' size={20} />
              </a>
              <a href='https://instagram.com/i-vanga' target='_blank' rel='noreferrer'>
                <Icon name='instagram' size={20} />
              </a>
              <a href='https://discord.gg/i-vanga' target='_blank' rel='noreferrer'>
                <Icon name='discord' size={20} />
              </a>
              <a href='https://tiktok.com/@i-vanga' target='_blank' rel='noreferrer'>
                <Icon name='tiktok' size={20} />
              </a>
            </div>
          </div>

          <div className={style.right}>
            <p>
              i-Vanga работает по всему миру через отдельные юридические лица. <a href='/us'>i-Vanga</a> управляется
              Unknown Origin Ltd. i-Vanga, a CFTC-regulated Designated Contract Market. Эта международная платформа не
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
