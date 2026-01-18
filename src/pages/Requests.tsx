import Modal from '../elements/modal'
import type { IBet, IRequest } from '../types/app.types'
import { useGetRequestsQuery, useGetBetsQuery } from '../services/api'
import { useModal } from '../hooks/hooks'
import ModalPrediction from '../modals/prediction'
import IconSprite from '../elements/icon/Icon'
import RequestItem from '../components/prediction/request'
import BetItem from '../components/prediction/bet'
import Loader from '../elements/loader'

export const Requests = () => {
  const { data, isLoading, error } = useGetRequestsQuery()
  const { data: bets, isLoading: betsLoading, error: betsError } = useGetBetsQuery()
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
            <div className='column gap12'>
              {isLoading && <div>Загрузка прогнозов...</div>}
              {error && <div className='error'>Ошибка загрузки прогнозов</div>}
              {data?.data.map((request: IRequest, idx: number) => (
                <RequestItem key={request.id} request={request} isLast={data?.data.length === idx + 1} />
              ))}
            </div>
            <hr className='hide' />
            <h1>Мое участие</h1>
            <hr />
          </>
        )}
        <div className='column gap12'>
          {bets?.data.length === 0 && (
            <div className='empty'>
              <IconSprite name='draft' size={24} />
              <span>У вас нет активных прогнозов</span>
            </div>
          )}
          {betsLoading && (
            <div className='empty'>
              <Loader />
              <span>Загрузка прогнозов...</span>
            </div>
          )}
          {betsError && (
            <div className='empty'>
              <IconSprite name='error' size={24} />
              <span>Ошибка загрузки прогнозов</span>
            </div>
          )}
          {bets?.data.length !== 0 && (
            <>
              {bets?.data.map((bet: IBet) => (
                <BetItem key={bet.id} bet={bet} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
