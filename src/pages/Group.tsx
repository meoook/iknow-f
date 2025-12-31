import { useEffect, useState } from 'react'
import { useSearchPredictionsQuery } from '../services/api'
import { useParams } from 'react-router-dom'

export const Group = () => {
  const { id } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const { data: predictions, isLoading, error } = useSearchPredictionsQuery(searchQuery, { skip: !searchQuery })

  // useEffect(() => {
  //   if (!isLoading) {
  //     const lookup = bots?.find((b) => b.id === Number(id))
  //     if (!lookup) navigate('/bots', { replace: true })
  //     else {
  //       setBot(lookup)
  //     }
  //   }
  // }, [bots, id, isLoading, navigate])

  return (
    <div className='page-container'>
      <h1>Search Groups</h1>

      <div className='search-section'>
        <input
          type='text'
          placeholder='Search groups...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='search-input'
        />
      </div>

      {isLoading && <div>Searching...</div>}
      {error && <div className='error'>Search failed</div>}

      {predictions && predictions.length > 0 && (
        <div className='predictions-grid'>
          {predictions.map((prediction: any) => (
            <div key={prediction.id} className='prediction-card'>
              <h3>{prediction.title}</h3>
              <p>{prediction.description}</p>
            </div>
          ))}
        </div>
      )}

      {predictions && predictions.length === 0 && searchQuery && <div>No predictions found</div>}
    </div>
  )
}
