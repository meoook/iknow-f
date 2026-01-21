import Modal from '../elements/modal'
import type { IMyBet, IRequest } from '../types/app.types'
import { useGetRequestsQuery, useGetMyBetsQuery } from '../services/api'
import { useModal } from '../hooks/hooks'
import ModalPrediction from '../modals/prediction'
import RequestItem from '../components/prediction/request'
import BetItem from '../components/prediction/bet'
import Empty from '../elements/empty'

export const Requests = () => {
  const { data, isLoading, error } = useGetRequestsQuery()
  const { data: bets, isLoading: betsLoading, error: betsError } = useGetMyBetsQuery()
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
          {bets?.data.length === 0 && <Empty title='У вас нет активных прогнозов' />}
          {betsLoading && <Empty title='Загрузка прогнозов...' loading={true} />}
          {betsError && <Empty title='Ошибка загрузки прогнозов' />}
          {bets?.data.length !== 0 && (
            <>
              {bets?.data.map((bet: IMyBet) => (
                <BetItem key={bet.id} bet={bet} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
