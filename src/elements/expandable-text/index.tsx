import { useState } from 'react'
import IconSprite from '../icon'
import s from './expandable-text.module.scss'

interface ExpandableTextProps {
  text?: string
  maxLength?: number
  className?: string
  containerClassName?: string
  showMoreText?: string
  showLessText?: string
  showMoreIcon?: boolean
}

export default function ExpandableText({
  text,
  maxLength = 600,
  className,
  containerClassName,
  showMoreText = 'Показать больше',
  showLessText = 'Показать меньше',
  showMoreIcon = false,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= maxLength) {
    return <div className={className}>{text}</div>
  }

  const displayedText = isExpanded ? text : `${text.slice(0, maxLength).trimEnd()}...`

  return (
    <div className={`${s.container}${containerClassName ? ` ${containerClassName}` : ''}`}>
      <div className={className}>{displayedText}</div>
      <button
        type='button'
        className={s.toggleBtn}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span>{isExpanded ? showLessText : showMoreText}</span>
        {isExpanded ? (
          <IconSprite name='arrow_up' size={14} />
        ) : showMoreIcon ? (
          <IconSprite name='arrow_down' size={14} />
        ) : null}
      </button>
    </div>
  )
}
