import style from './bottom-search.module.scss'
import PredictionSearch from '../search'

export default function ModalBottomSearch() {
  return (
    <div className={style.container}>
      <div className={style.header}>
        <h2 className={style.title}>Поиск</h2>
      </div>
      <div className={style.content}>
        <PredictionSearch />
      </div>
    </div>
  )
}
