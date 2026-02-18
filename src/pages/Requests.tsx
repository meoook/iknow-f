import Modal from '../elements/modal'
import { useRequestIds } from '../services/requests/adapter'
import { useMybetIds } from '../store/mybet.adapter'
import { useModal } from '../hooks/hooks'
import ModalPrediction from '../modals/prediction'
import RequestItem from '../components/prediction/request'
import BetItem from '../components/prediction/bet'
import Empty from '../elements/empty'

export default function Requests() {
  const { requestIds, isLoading, isError } = useRequestIds()
  const { mybetIds, isLoading: betsLoading, isError: betsError } = useMybetIds()
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
        {requestIds.length !== 0 && (
          <>
            <div className='column gap12'>
              {isLoading && <Empty title='Загрузка прогнозов...' loading={true} />}
              {isError && <Empty title='Ошибка загрузки прогнозов' />}
              {requestIds.map((requestId: number, idx: number) => (
                <RequestItem key={requestId} requestId={requestId} isLast={idx === requestIds.length - 1} />
              ))}
            </div>
            <hr className='hide' />
            <h1>Мое участие</h1>
            <hr />
          </>
        )}
        <div className='column gap12'>
          {mybetIds.length === 0 && <Empty title='У вас нет активных прогнозов' />}
          {betsLoading && <Empty title='Загрузка прогнозов...' loading={true} />}
          {betsError && <Empty title='Ошибка загрузки прогнозов' />}
          {mybetIds.length !== 0 && mybetIds.map((betId: number) => <BetItem key={betId} betId={betId} />)}
        </div>
      </div>
    </>
  )
}
