import Modal from '../elements/modal'
import { useModal } from '../hooks/hooks'
import ModalPrediction from '../modals/prediction'
import { useGetMyRequestsQuery } from '../services/api'

export const MyRequests = () => {
  const { data: requests, isLoading, error } = useGetMyRequestsQuery()
  const [modal, open, close] = useModal()

  return (
    <>
      <Modal close={close} modal={modal}>
        <ModalPrediction />
      </Modal>
      <div className='container'>
        <section>
          <div className='row center justify'>
            <h1>Мои прогнозы</h1>
            <button className='btn blue' onClick={open}>
              Создать
            </button>
          </div>
          <hr />

          {isLoading && <div>Загрузка прогнозов...</div>}
          {error && <div className='error'>Ошибка загрузки прогнозов</div>}

          {requests && requests.length > 0 && (
            <div className='items-list'>
              {requests.map((request: any) => (
                <div key={request.id} className='item-card'>
                  <h3>{request.title}</h3>
                  <p>{request.description}</p>
                  <div className='item-meta'>
                    <span>Статус: {request.status}</span>
                    <span>Создано: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {requests && requests.length === 0 && <div>Запросов не найдено</div>}
        </section>
      </div>
    </>
  )
}
