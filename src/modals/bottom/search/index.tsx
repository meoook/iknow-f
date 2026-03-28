import style from './search.module.scss'
import PredictionSearch from '../../../components/search'

export default function ModalBottomSearch() {
  return (
    <div className={style.container}>
      <PredictionSearch mobile />
    </div>
  )
}
