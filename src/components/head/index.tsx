import style from './head.module.scss'

interface PredictionHeadProps {
  icon?: string
  title: string
  big?: boolean
  progress?: number
}

export default function PredictionHead({ icon, title, big, progress }: PredictionHeadProps) {
  const MIN_SCALE = 0.8
  const scale = Math.max(MIN_SCALE, 1 - 0.9 * (progress || 0))
  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = icon ? `${imgUrl}${icon}` : `${imgUrl}/icon/no_icon.png`
  return (
    <div className={style.head}>
      {!!progress ? (
        <>
          <div className='row center gap12' style={{ transform: `scale(${scale})` }}>
            <img src={src} alt={title} />
            {big ? <h1>{title}</h1> : <h3>{title}</h3>}
          </div>
          <div className={style.hr} style={{ opacity: progress || 0 }} />
        </>
      ) : (
        <>
          <div className='row center gap12'>
            <img src={src} alt={title} />
            {big ? <h1>{title}</h1> : <h3>{title}</h3>}
          </div>
        </>
      )}
    </div>
  )
}
