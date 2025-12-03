import { useGetMyPredictionsQuery } from '../services/api'

export const MyPredictions = () => {
  const { data: predictions, isLoading, error } = useGetMyPredictionsQuery()

  return (
    <div className='page-container'>
      <h1>My Predictions</h1>

      {isLoading && <div>Loading predictions...</div>}
      {error && <div className='error'>Failed to load predictions</div>}

      {predictions && predictions.length > 0 && (
        <div className='items-list'>
          {predictions.map((prediction: any) => (
            <div key={prediction.id} className='item-card'>
              <h3>{prediction.title}</h3>
              <p>{prediction.description}</p>
              <div className='item-meta'>
                <span>Confidence: {prediction.confidence}%</span>
                <span>
                  Created: {new Date(prediction.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {predictions && predictions.length === 0 && (
        <div>No predictions found</div>
      )}
    </div>
  )
}
