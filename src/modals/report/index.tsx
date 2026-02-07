import style from './report.module.scss'
import { useState } from 'react'
import { useReportCommentMutation } from '../../services/comments/api'
import IconSprite from '../../elements/icon/Icon'

const REASONS = [
  { value: 'ABUSE', label: 'Унижение личности' },
  { value: 'SPAM', label: 'Спам' },
  { value: 'FAKE', label: 'Фейки' },
  { value: 'RACE', label: 'Рассовые или религиозные оскорбления' },
  { value: 'OTHER', label: 'Другое' },
]

interface ModalReportProps {
  prediction: number
  commentId: number
  close: () => void
}

export default function ModalReport({ prediction, commentId, close }: ModalReportProps) {
  const [text, setText] = useState('')
  const [reason, setReason] = useState('OTHER')
  const [reportSend] = useReportCommentMutation()

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedReason = e.target.value
    setReason(selectedReason)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value
    if (inputText.length <= 6) setText(inputText)
  }

  const handleSubmit = () => {
    if (text.length > 0) {
      reportSend({ prediction, comment: commentId, reason, text })
        .unwrap()
        .then(() => close())
    }
  }

  return (
    <div className={`${style.wrapper} noscroll`}>
      <div className='row center middle gap'>
        <IconSprite name='report' size={32} />
        <h1>Жалоба</h1>
      </div>
      {/* <hr /> */}
      <div className='column gap16'>
        <div className='column gap4'>
          <div className='label'>Выберите причину</div>
          <select className='outline' name='chain' value={reason} onChange={handleReasonChange}>
            {REASONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <textarea className='outline' name='text' value={text} onChange={handleTextChange} placeholder='Комментарий' />
        <button className='btn blue' onClick={handleSubmit}>
          Отправить
        </button>
      </div>
    </div>
  )
}
