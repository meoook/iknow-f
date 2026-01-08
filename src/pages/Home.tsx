import PredictionCard from '../components/card'
import IconSprite from '../elements/icon/Icon'
import Loader from '../elements/loader'
import { useGetPredictionsQuery } from '../services/api'
import type { IPrediction } from '../types/app.types'

export const Home = () => {
  const { data, isLoading, error } = useGetPredictionsQuery()

  return (
    <section>
      {isLoading && (
        <div className='empty'>
          <Loader />
          <span>Загрузка...</span>
        </div>
      )}
      {error && (
        <div className='empty error'>
          <IconSprite name='error' />
          <span>Ошибка загрузки</span>
        </div>
      )}
      {data && data.data.length === 0 && (
        <div className='empty'>
          <IconSprite name='draft' />
          <span>Предсказания отсутствуют</span>
        </div>
      )}
      {data && data.data.length > 0 && (
        <>
          {data.data.map((prediction: IPrediction) => (
            <PredictionCard prediction={prediction} />
          ))}
        </>
      )}
    </section>
  )
}
