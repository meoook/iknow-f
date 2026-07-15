import s from './head.module.scss'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { GROUPS_MAP } from '../../utils/date'

interface PredictionHeadProps {
  icon?: string | null
  title: string
  groups?: string[]
  big?: boolean
  progress?: number
}

export default function PredictionHead({ icon, title, groups, big, progress }: PredictionHeadProps) {
  const MIN_SCALE = 0.8
  const scale = Math.max(MIN_SCALE, 1 - 0.9 * (progress || 0))
  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = icon ? `${imgUrl}${icon}` : `${imgUrl}/icon/no_icon.png`

  if (!big)
    return (
      <div className={s.head}>
        <div className='row center gap-2'>
          <img src={src} alt={title} />
          <div className='column'>
            {groups && <Groups groups={groups} hide={!!progress} />}
            <h3 className='clamp-2'>{title}</h3>
          </div>
        </div>
      </div>
    )

  return (
    <div className={s.head}>
      <div className='row center gap-2' style={{ transform: `scale(${scale})` }}>
        <img src={src} alt={title} />
        <div className='column'>
          {groups && <Groups groups={groups} hide={!!progress} />}
          <h1 className='clamp-2'>{title}</h1>
        </div>
      </div>
      <div className={s.hr} style={{ opacity: progress || 0 }} />
    </div>
  )
}

const Groups = ({ groups, hide }: { groups: string[]; hide?: boolean }) => {
  const classNames = hide ? 'mh-0 opacity-0' : 'mh-fit opacity-1 pb-1'
  return (
    <div className={`row center gap-2 transition ${classNames}`}>
      {groups.map((group, index) => (
        <Fragment key={group}>
          <Link to={`/${group.toLowerCase()}`} className='text-sm secondary h-brand capitalize'>
            {GROUPS_MAP[group.toLowerCase()]}
          </Link>
          {index < groups.length - 1 && <span className='secondary'>·</span>}
        </Fragment>
      ))}
    </div>
  )
}
