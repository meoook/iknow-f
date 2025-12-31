import { useGetPredictionsQuery } from '../services/api'

export const Home = () => {
  const { data: predictions, isLoading, error } = useGetPredictionsQuery()

  return (
    <div className='page-container'>
      <section className='predictions-section'>
        <h2>Predictions</h2>

        {isLoading && <div>Loading predictions...</div>}
        {error && <div className='error'>Failed to load predictions</div>}

        {predictions && predictions.length > 0 && (
          <div className='groups-grid'>
            {predictions.map((prediction: any) => (
              <div key={prediction.id} className='group-card'>
                <h3>{prediction.name}</h3>
                <p>{prediction.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
