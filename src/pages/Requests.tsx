import Modal from '../elements/modal'
import type { IRequest } from '../types/app.types'
import { useGetRequestsQuery } from '../services/api'
import { useModal } from '../hooks/hooks'
import ModalPrediction from '../modals/prediction'
import Loader from '../elements/loader'
import IconSprite from '../elements/icon/Icon'

export const Requests = () => {
  const { data, isLoading, error } = useGetRequestsQuery()
  const [modal, open, close] = useModal()

  return (
    <>
      <Modal close={close} modal={modal}>
        <ModalPrediction close={close} />
      </Modal>
      <div className='container'>
        <div className='row center justify'>
          <h1>Мои прогнозы</h1>
          <button className='btn blue' onClick={open}>
            Создать
          </button>
        </div>
        <hr />
        {data?.data.length !== 0 && (
          <>
            <section>
              {isLoading && <div>Загрузка прогнозов...</div>}
              {error && <div className='error'>Ошибка загрузки прогнозов</div>}
              {data?.data.map((request: IRequest) => (
                <RequestItem key={request.id} request={request} />
              ))}
            </section>
            <h3>Мое участие</h3>
            <hr />
          </>
        )}
        <section>
          <div className='empty'>
            <IconSprite name='draft' size={24} />
            <span>У вас нет активных прогнозов</span>
          </div>
        </section>
      </div>
    </>
  )
}

const RequestItem = ({ request }: { request: IRequest }) => {
  return (
    <div key={request.id} className='card'>
      <div className={request.vote ? 'picture green' : 'picture red'}>
        <div className='row justify'>
          <span>{request.vote ? 'Сбудется' : 'Не сбудется'}</span>
          <span>{new Date(request.end_date).toLocaleDateString()}</span>
        </div>
        <div className='row justify'>
          <span>Баллы</span>
          <span>{Number(request.amount).toFixed(2)}</span>
        </div>
        {request.state == 'REJECTED' && (
          <div className='popup reject'>
            <div className='row center gap4'>
              <IconSprite name='warning' size={20} />
              <span>Отклонено</span>
            </div>
            {request.reject_reason && (
              <small className='line-clamp-3' title={request.reject_reason}>
                {request.reject_reason}
              </small>
            )}
          </div>
        )}
        {request.state == 'VALIDATE' && (
          <div className='popup'>
            <div className='row center gap4'>
              <Loader />
              <span>Ожидает подтверждения...</span>
            </div>
          </div>
        )}
      </div>
      <div className='title'>
        <h3 className='line-clamp-2' title={request.title}>
          {request.title}
        </h3>
      </div>
      <div className='rules'>{request.rules}</div>
      {/* <div>Таг: {request.tag}</div> */}
      {/* <div>Статус: {request.state}</div> */}
      {/* {request.reject_reason && <div>Отклонено: {request.reject_reason}</div>} */}
    </div>
  )
}
