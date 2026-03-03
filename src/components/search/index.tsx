import { useState, useEffect } from 'react'
import style from './search.module.scss'
import IconSprite from '../../elements/icon/Icon'
import { useSearchPredictionsMutation } from '../../services/api'
import { useClickOutside } from '../../hooks/hooks'

export default function PredictionSearch() {
  const [searchValue, setSearchValue] = useState('')
  const [search, { data: predictions, reset }] = useSearchPredictionsMutation()
  const [searchRef, isSearchOpen, searchToggle] = useClickOutside()

  useEffect(() => {
    if (searchValue.trim().length === 0) {
      reset()
      return
    }

    const timer = setTimeout(() => {
      search(searchValue)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchValue, search, reset])

  const handleClear = () => {
    setSearchValue('')
    reset()
  }

  const handleFocus = () => {
    if (!isSearchOpen) {
      searchToggle({} as any) // useClickOutside expects React.MouseEventHandler, but we just need to trigger it
    }
  }

  return (
    <div className={style.searchWrapper} ref={searchRef}>
      <form className={style.input} onSubmit={(e) => e.preventDefault()}>
        <input
          name='search'
          placeholder='Поиск'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleFocus}
          autoComplete='off'
        />
        <IconSprite name='search' />
        {searchValue && (
          <button type='button' className={style.clearBtn} onClick={handleClear}>
            <IconSprite name='close' size={16} />
          </button>
        )}
      </form>
      {isSearchOpen && predictions && predictions.length > 0 && (
        <div className={style.dropdown}>
          {predictions.map((item: any) => (
            <div key={item.id} className={style.dropdownItem}>
              {item.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
