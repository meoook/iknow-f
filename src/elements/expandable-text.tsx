import { useState } from 'react'
import IconSprite from './icon'

interface ExpandableTextProps {
  text?: string
  maxLength?: number
  showMoreText?: string
  showLessText?: string
}

export default function ExpandableText({
  text,
  maxLength = 600,
  showMoreText = 'Показать больше',
  showLessText = 'Показать меньше',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const baseClass = 'text-sm secondary pre-line lh-5'

  if (!text) return null
  if (text.length <= maxLength) return <div className={baseClass}>{text}</div>

  if (!isExpanded) {
    return (
      <button
        tabIndex={0}
        className={`hover-o ${baseClass} left`}
        onClick={() => setIsExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(true)
          }
        }}
      >
        <span>{text.slice(0, maxLength).trimEnd()}...</span>
        <span className='color-brand w-500 nowrap ph-1'>{showMoreText}</span>
      </button>
    )
  }

  return (
    <div className='column start'>
      <div className={baseClass}>{text}</div>
      <button
        type='button'
        className='flex-i center pt-1 color-brand hover-o text-sm w-500'
        onClick={() => setIsExpanded(false)}
      >
        <span>{showLessText}</span>
        <IconSprite name='arrow_up' size={14} />
      </button>
    </div>
  )
}
