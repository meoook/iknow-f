import style from './search.module.scss'
import { useState, useEffect, useRef } from 'react'
import { useSearchPredictionsMutation } from '../../services/api'
import { intlNumber, useClickOutside } from '../../hooks/hooks'
import IconSprite from '../../elements/icon'
import Empty from '../../elements/empty'
import type { IPredictionSearch } from '../../types/app.types'
import { Link } from 'react-router-dom'
import { useModalContext } from '../../services/ModalContext'

export default function PredictionSearch({ mobile = false }: { mobile?: boolean }) {
  const [searchValue, setSearchValue] = useState('')
  const { closeModal } = useModalContext()
  const [search, { data: predictions, isLoading, isSuccess, reset }] = useSearchPredictionsMutation()
  const [searchRef, isSearchOpen, searchToggle] = useClickOutside()
  const lastSearchValue = useRef('')

  useEffect(() => {
    const trimmedValue = searchValue.trim()

    if (trimmedValue.length === 0) {
      reset()
      lastSearchValue.current = ''
      return
    }

    if (trimmedValue === lastSearchValue.current) return

    const timer = setTimeout(() => {
      search(trimmedValue)
      lastSearchValue.current = trimmedValue
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchValue, search, reset])

  const handleClear = () => {
    setSearchValue('')
    reset()
    lastSearchValue.current = ''
    if (mobile) closeModal()
  }

  const handleFocus = () => {
    if (!isSearchOpen) searchToggle()
  }

  const opened = isSearchOpen && (isLoading || isSuccess || searchValue)

  const className = mobile ? `${style.wrapper} pt-2` : `${style.wrapper} md-hide`
  return (
    <div className={className} ref={searchRef}>
      <form className={`${style.input}${opened ? ' open' : ''}`} onSubmit={(e) => e.preventDefault()}>
        <input
          name='search'
          placeholder='Поиск'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleFocus}
          // onBlur={handleBlur}
          autoComplete='off'
        />
        <IconSprite name='search' />
        {searchValue && (
          <button type='button' className={style.clear} onClick={handleClear}>
            <IconSprite name='close' size={18} />
          </button>
        )}
      </form>
      {opened && (
        <div className={style.dropdown}>
          {!predictions && (isLoading || searchValue) && <Empty title='Загрузка...' loading />}
          {predictions && predictions.length > 0 && (
            <>
              {predictions.map((item: IPredictionSearch) => (
                <SearchItem key={item.id} prediction={item} clear={handleClear} />
              ))}
            </>
          )}
          {predictions && predictions.length === 0 && <Empty title='Ничего не найдено' />}
        </div>
      )}
    </div>
  )
}

const SearchItem = ({ prediction, clear }: { prediction: IPredictionSearch; clear: () => void }) => {
  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = prediction.icon ? `${imgUrl}${prediction.icon}` : `${imgUrl}/icon/no_icon.png`
  const volume = intlNumber('en-US', prediction.volume)
  return (
    <Link to={`/prediction/${prediction.id}`} className={style.item} onClick={clear}>
      <img src={src} alt={prediction.title} />
      <span className='grow truncate'>{prediction.title}</span>
      <span className='color-green'>${volume}</span>
    </Link>
  )
}
