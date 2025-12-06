import { useState } from 'react'
import { useSearchGroupsQuery } from '../services/api'

export const Group = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    data: groups,
    isLoading,
    error,
  } = useSearchGroupsQuery(searchQuery, {
    skip: !searchQuery,
  })

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

      {groups && groups.length > 0 && (
        <div className='groups-grid'>
          {groups.map((group: any) => (
            <div key={group.id} className='group-card'>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
            </div>
          ))}
        </div>
      )}

      {groups && groups.length === 0 && searchQuery && <div>No groups found</div>}
    </div>
  )
}
