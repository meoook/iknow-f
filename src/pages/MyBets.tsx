import { useGetMyBetsQuery } from '../services/api'

export const MyBets = () => {
  const { data: bets, isLoading, error } = useGetMyBetsQuery()

  return (
    <div className='page-container'>
      <h1>My Bets</h1>

      {isLoading && <div>Loading bets...</div>}
      {error && <div className='error'>Failed to load bets</div>}

      {bets && bets.length > 0 && (
        <div className='items-list'>
          {bets.map((bet: any) => (
            <div key={bet.id} className='item-card'>
              <h3>{bet.title}</h3>
              <p>{bet.description}</p>
              <div className='item-meta'>
                <span>Amount: {bet.amount}</span>
                <span>Status: {bet.status}</span>
                <span>
                  Created: {new Date(bet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {bets && bets.length === 0 && <div>No bets found</div>}
    </div>
  )
}
