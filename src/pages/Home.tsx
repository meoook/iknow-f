import { useGetGroupsQuery } from '../services/api'

export const Home = () => {
  const { data: groups, isLoading, error } = useGetGroupsQuery()

  return (
    <div className='page-container'>
      <section className='groups-section'>
        <h2>Groups</h2>

        {isLoading && <div>Loading groups...</div>}
        {error && <div className='error'>Failed to load groups</div>}

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
      </section>
    </div>
  )
}
