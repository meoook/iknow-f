import { useModalContext } from '../../../services/ModalContext'
import type { IChoice, IPredictionDetail } from '../../../types/app.types'
import TradeContent from './TradeContent'

interface TradeModalProps {
  prediction: IPredictionDetail
  choice: IChoice | null
}

export default function TradeModal({ prediction, choice }: TradeModalProps) {
  const { closeModal } = useModalContext()

  return <TradeContent prediction={prediction} selectedChoice={choice} onSuccess={closeModal} />
}
