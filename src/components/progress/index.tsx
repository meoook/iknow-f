import { intlNumber } from '../../hooks/hooks'
import style from './progress.module.scss'

interface PredictionProgressProps {
  yes: number
  no: number
  diff: number
}

export default function PredictionProgress({ yes, no, diff }: PredictionProgressProps) {
  const volumeYes = intlNumber('ru-RU', yes)
  const volumeNo = intlNumber('ru-RU', no)

  const total = yes + no
  const limit = total < 1000 ? 10 + (total / 1000) * 40 : 100

  let widthYes = 0
  let widthNo = 0

  if (total > 0) {
    const diffRatio = Math.abs(yes - no) / total
    if (yes >= no) {
      widthYes = limit
      widthNo = limit * (1 - diffRatio)
    } else {
      widthNo = limit
      widthYes = limit * (1 - diffRatio)
    }
  }

  return (
    <div className={style.main}>
      <div className={style.left}>
        <div className={style.label}>Нет</div>
        <div className={style.progress}>
          <div className={`${style.bar} ${style.no}`} style={{ width: widthNo + '%' }}>
            &nbsp;
          </div>
          <span className={style.volume}>{volumeNo}</span>
        </div>
      </div>
      <div className='column center'>
        <div className={style.label}>Разница</div>
        <div className={style.diff}>
          {diff > 0 && `X`}
          {diff}
        </div>
      </div>
      <div className={style.right}>
        <div className={style.label}>Да</div>
        <div className={style.progress}>
          <div className={`${style.bar} ${style.yes}`} style={{ width: widthYes + '%' }}>
            &nbsp;
          </div>
          <span className={style.volume}>{volumeYes}</span>
        </div>
      </div>
    </div>
  )
}
