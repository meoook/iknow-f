import { useGetPredictionsQuery } from '../services/api'
import type { IPrediction } from '../types/app.types'
import PredictionCard from '../components/card'
import Empty from '../elements/empty'

export const Home = () => {
  const { data, isLoading, error } = useGetPredictionsQuery()

  if (isLoading) return <Empty title='Загрузка...' loading={true} size={24} />
  if (error) return <Empty title='Ошибка загрузки' size={24} />
  if (!data) return <Empty title='Ошибка получения предсказаний' size={24} />
  if (data.data.length === 0) return <Empty title='Предсказания отсутствуют' size={24} />

  return (
    <section>
      {data.data.map((prediction: IPrediction) => (
        <PredictionCard prediction={prediction} />
      ))}
    </section>
  )
}
