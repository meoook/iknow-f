import style from './modal.module.scss'
import { useModalContext } from '../../services/ModalContext'
import { useEffect, useRef } from 'react'
import IconSprite from '../icon'

export default function ModalRenderer() {
  const { modal, closeModal } = useModalContext()
  const sheetRef = useRef<HTMLDivElement>(null)

  const handle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeModal])

  // Сброс позиции при появлении
  useEffect(() => {
    if (modal?.type === 'bottom' && sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }, [modal])

  // ── Drag handlers для bottom sheet ──────────────────────────────────
  useEffect(() => {
    const type = modal?.type
    if (!sheetRef.current || type !== 'bottom') return

    const el = sheetRef.current
    let isDragging = false
    let startY = 0
    let currentY = 0

    const onStart = (clientY: number, target: HTMLElement) => {
      // Игнорируем вложенные интерактивные элементы (инпуты, ссылки, кнопки)
      if (['INPUT', 'BUTTON', 'TEXTAREA'].includes(target.tagName) || target.closest('a')) return

      // Проверяем, скроллится ли контент: если юзер тянет внутри списка и он не наверху - не тащим
      // Если у нас поиск - это .content (из bottom-search) или другой блок с overflow-y
      const scrollable = target.closest('[style*="overflow"], [class*="content"]') as HTMLElement
      if (scrollable && scrollable.scrollTop > 0) return

      isDragging = true
      startY = clientY
      currentY = 0

      // Отключаем начальную CSS-анимацию, иначе она перекрывает inline-transform!
      el.style.animation = 'none'
      el.style.transition = 'none'
      document.body.style.userSelect = 'none' // чтоб при мыши не выделялся текст
    }

    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const delta = clientY - startY

      // Запрещаем утягивать вверх выше 0, чтобы снизу не было видно "дырку"
      const dragY = Math.max(0, delta)
      currentY = dragY

      // Если мы тянем лист вниз, предотвращаем скролл контента внутри и pull-to-refresh
      if (delta > 0 && e.cancelable) e.preventDefault()

      el.style.transform = `translateY(${dragY}px)`
    }

    const onEnd = () => {
      if (!isDragging) return
      isDragging = false
      document.body.style.userSelect = ''

      const threshold = el.offsetHeight * 0.25
      if (currentY > threshold) {
        el.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        el.style.transform = `translateY(100%)`
        setTimeout(closeModal, 300)
      } else {
        el.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        el.style.transform = 'translateY(0)'
      }
    }

    const onTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientY, e.target as HTMLElement)
    const onMouseDown = (e: MouseEvent) => onStart(e.clientY, e.target as HTMLElement)

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)

      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
    }
  }, [modal?.type, closeModal])

  if (!modal) return null

  const { component: Component, props, closeOutside, type } = modal

  const handleClose = () => {
    if (type === 'bottom' && sheetRef.current) {
      const el = sheetRef.current
      // Отключаем стартовую CSS-анимацию
      el.style.animation = 'none'

      // ВАЖНО: заставляем браузер перерисовать элемент (reflow),
      // иначе он схлопнет animation: none и transform вместе без плавности
      void el.offsetHeight

      // Ставим время такое же, как у анимации появления (0.35s)
      el.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
      el.style.transform = 'translateY(100%)'
      // Удаляем меню из дерева чуть раньше визуального конца (330ms), чтобы не было "прыжков"
      setTimeout(closeModal, 330)
    } else {
      closeModal()
    }
  }

  const handleOutsideClick = () => {
    if (closeOutside !== false) handleClose()
  }

  if (type === 'bottom') {
    return (
      <div className='overlay middle end hide md-flex' onClick={handleOutsideClick}>
        <div ref={sheetRef} className={style.sheet} onClick={handle}>
          <div className={style.handle}>
            <span className={style.bar} />
          </div>
          <Component {...props} close={handleClose} />
        </div>
      </div>
    )
  }

  return (
    <div className='overlay middle center row' onClick={handleOutsideClick}>
      <div className={style.modal} onClick={handle}>
        <Component {...props} close={handleClose} />
        <button className={style.close} onClick={handleClose}>
          <IconSprite name='close' />
        </button>
      </div>
    </div>
  )
}
