import style from './totop.module.scss'
import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.scrollY > window.innerHeight * 1.8) setIsVisible(true)
    else setIsVisible(false)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <div className={`${style.container} ${isVisible ? style.visible : ''}`} onClick={scrollToTop}>
      <span>На верх</span>
      <svg className={style.icon} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
        <path d='M12 4l-8 8h6v8h4v-8h6z' />
      </svg>
    </div>
  )
}
