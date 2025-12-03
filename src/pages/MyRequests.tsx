import { useGetMyRequestsQuery } from '../services/api'

export const MyRequests = () => {
  const { data: requests, isLoading, error } = useGetMyRequestsQuery()

  return (
    <div className='page-container'>
      <h1>My Requests</h1>

      {isLoading && <div>Loading requests...</div>}
      {error && <div className='error'>Failed to load requests</div>}

      {requests && requests.length > 0 && (
        <div className='items-list'>
          {requests.map((request: any) => (
            <div key={request.id} className='item-card'>
              <h3>{request.title}</h3>
              <p>{request.description}</p>
              <div className='item-meta'>
                <span>Status: {request.status}</span>
                <span>
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests && requests.length === 0 && <div>No requests found</div>}
    </div>
  )
}
