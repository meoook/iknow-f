import s from './timeline.module.scss'
import { useEffect, useState } from 'react'
import { TPredictionState, type IPredictionDetail } from '../../../types/app.types'

const formatDate = (val: string | number | null | undefined): string => {
    if (!val) return ''
    const timestamp = typeof val === 'number' && val < 1e11 ? val * 1000 : val
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString()
}

export default function PredictionTimeLine({ prediction }: { prediction: IPredictionDetail }) {
    const [now, setNow] = useState<number>(() => Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    if (!prediction) return null

    const isEnded = prediction.state === TPredictionState.ENDED || Boolean(prediction.closed)

    const tCreated = prediction.created
        ? (typeof prediction.created === 'number' && prediction.created < 1e11
            ? prediction.created * 1000
            : new Date(prediction.created).getTime())
        : 0

    const tBet = prediction.bet_date ? new Date(prediction.bet_date).getTime() : 0
    const tEnd = prediction.end_date ? new Date(prediction.end_date).getTime() : 0

    // Dots active state
    const dot1Active = true
    const dot2Active = isEnded || now >= tBet
    const dot3Active = isEnded || now >= tEnd
    const dot4Active = isEnded

    // Segment 1: Created -> Bet date
    let seg1size = 0
    if (isEnded || (tBet > 0 && now >= tBet)) {
        seg1size = 100
    } else if (tBet > tCreated && now > tCreated) {
        seg1size = Math.min(Math.max(((now - tCreated) / (tBet - tCreated)) * 100, 0), 100)
    }

    // Segment 2: Bet date -> End date
    let seg2size = 0
    const isSeg2Running = now >= tBet && now < tEnd
    if (isEnded || (tEnd > 0 && now >= tEnd)) {
        seg2size = 100
    } else if (isSeg2Running && tEnd > tBet) {
        seg2size = Math.min(Math.max(((now - tBet) / (tEnd - tBet)) * 100, 0), 100)
    }

    // Segment 3: End date -> Closed
    const seg3size = isEnded ? 100 : now > tEnd ? 50 : 0
    // let seg3size = 0
    // if (isEnded) seg3size = 100
    // else if (now > tEnd) seg3size = 50

    return (
        <div className={s.container}>
            <div className='row relative w-full'>
                {/* Segment 1 */}
                <div className='column center w-full'>
                    <span className={s.label}>ПРИЕМ СТАВОК</span>
                    <div className='row center w-full relative'>
                        <div className={`${s.dot}${dot1Active ? ' active' : ''}`} />
                        <div className={s.track}>
                            {seg1size > 0 && <div className={s.solid} />}
                            {seg1size > 0 && <div className={s.dashed} style={{ left: `${seg1size}%` }} />}
                        </div>
                    </div>
                </div>

                {/* Segment 2 */}
                <div className='column center w-full'>
                    <span className={`${s.label} ${now < tBet && !isEnded ? s.pending : ''}`}>ОЖИДАНИЕ СОБЫТИЯ</span>
                    <div className='row center w-full relative'>
                        <div className={`${s.dot}${dot2Active ? ' active' : ''}`} />
                        <div className={s.track}>
                            {seg2size > 0 && <div className={s.solid} style={{ width: `${seg2size}%` }} />}
                            {seg2size > 0 && <div className={s.dashed} style={{ left: `${seg2size}%` }} />}
                        </div>
                    </div>
                </div>

                {/* Segment 3 */}
                <div className='column center w-full'>
                    <span className={`${s.label} ${now < tEnd && !isEnded ? s.pending : ''}`}>ИТОГИ</span>
                    <div className='row center w-full relative'>
                        <div className={`${s.dot}${dot3Active ? ' active' : ''}`} />
                        <div className={s.track}>
                            {seg3size > 0 && <div className={s.solid} style={{ width: `${seg3size}%` }} />}
                            {seg3size > 0 && <div className={s.dashed} style={{ left: `${seg3size}%` }} />}
                        </div>
                        <div className={`${s.dot}${s.lastDot}${dot4Active ? ' active' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Checkpoint labels positioned under each dot */}
            <div className={s.wrapper}>
                <div className={`${s.checkpoint} ${s.first}`}>
                    <span className={`${s.title}${dot1Active ? ' active' : ''}`}>Создано</span>
                    <span className={s.checkpointDate}>{formatDate(prediction.created)}</span>
                </div>

                <div className={`${s.checkpoint} ${s.second}`}>
                    <span className={`${s.title}${dot2Active ? ' active' : ''}`}>Закрытие ставок</span>
                    <span className={s.checkpointDate}>{formatDate(prediction.bet_date)}</span>
                </div>

                <div className={`${s.checkpoint} ${s.third}`}>
                    <span className={`${s.title}${dot3Active ? ' active' : ''}`}>Окончание</span>
                    <span className={s.checkpointDate}>{formatDate(prediction.end_date)}</span>
                </div>

                <div className={`${s.checkpoint} ${s.last}`}>
                    <span className={`${s.title}${dot4Active ? ' active' : ''}`}>Выплата</span>
                    {prediction.closed && <span className={s.checkpointDate}>{formatDate(prediction.closed)}</span>}
                </div>
            </div>
        </div>
    )
}