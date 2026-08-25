import s from './timeline.module.scss'
import { useEffect, useState } from 'react'
import type { IPredictionDetail } from '../../../types/app.types'
import { TPredictionState } from '../../../types/app.types'

const formatDate = (val: string | number | null | undefined): string => {
    if (!val) return ''
    const timestamp = typeof val === 'number' && val < 1e11 ? val * 1000 : val
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return ''

    // return d.toLocaleDateString(undefined, {
    //     day: '2-digit',
    //     month: 'short',
    //     year: 'numeric',
    // })
    return d.toLocaleDateString()
}

export const PredictionTimeLine = ({ prediction }: { prediction: IPredictionDetail }) => {
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
    let seg1Solid = 0
    let seg1Dashed = 0
    let seg1DashedLeft = 0
    if (isEnded || (tBet > 0 && now >= tBet)) {
        seg1Solid = 100
    } else if (tBet > tCreated && now > tCreated) {
        seg1Solid = Math.min(Math.max(((now - tCreated) / (tBet - tCreated)) * 100, 0), 100)
        seg1Dashed = 100 - seg1Solid
        seg1DashedLeft = seg1Solid
    } else {
        seg1Dashed = 100
        seg1DashedLeft = 0
    }

    // Segment 2: Bet date -> End date
    let seg2Solid = 0
    let seg2Dashed = 0
    let seg2DashedLeft = 0
    const isSeg2Running = now >= tBet && now < tEnd
    if (isEnded || (tEnd > 0 && now >= tEnd)) {
        seg2Solid = 100
    } else if (isSeg2Running && tEnd > tBet) {
        seg2Solid = Math.min(Math.max(((now - tBet) / (tEnd - tBet)) * 100, 0), 100)
        seg2Dashed = 100 - seg2Solid
        seg2DashedLeft = seg2Solid
    }

    // Segment 3: End date -> Closed
    let seg3Solid = 0
    let seg3Dashed = 0
    let seg3DashedLeft = 0
    const isSeg3Running = !isEnded && now >= tEnd
    if (isEnded) {
        seg3Solid = 100
    } else if (isSeg3Running) {
        seg3Dashed = 100
        seg3DashedLeft = 0
    }

    return (
        <div className={s.container}>
            <div className={s.timeline}>
                <div className='row relative w-full'>
                    {/* Segment 1 */}
                    <div className='column center relative w-full'>
                        <span className={s.label}>ПРИЕМ СТАВОК</span>
                        <div className={s.wrapper}>
                            <div className={`${s.dot} ${dot1Active ? s.active : ''}`} />
                            <div className={s.trackLine}>
                                {seg1Solid > 0 && (
                                    <div className={s.solidBar} />
                                )}
                                {seg1Dashed > 0 && (
                                    <div className={s.dashedLine} style={{ left: `${seg1DashedLeft}%`, width: `${seg1Dashed}%` }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segment 2 */}
                    <div className='column center relative w-full'>
                        <span className={`${s.label} ${now < tBet && !isEnded ? s.pending : ''}`}>ОЖИДАНИЕ СОБЫТИЯ</span>
                        <div className={s.wrapper}>
                            <div className={`${s.dot} ${dot2Active ? s.active : ''}`} />
                            <div className={s.trackLine}>
                                {seg2Solid > 0 && (
                                    <div className={s.solidBar} style={{ width: `${seg2Solid}%` }} />
                                )}
                                {seg2Dashed > 0 && (
                                    <div className={s.dashedLine} style={{ left: `${seg2DashedLeft}%`, width: `${seg2Dashed}%` }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segment 3 */}
                    <div className='column center relative w-full'>
                        <span className={`${s.label} ${now < tEnd && !isEnded ? s.pending : ''}`}>ИТОГИ</span>
                        <div className={s.wrapper}>
                            <div className={`${s.dot} ${dot3Active ? s.dotActive : ''}`} />
                            <div className={s.trackLine}>
                                {seg3Solid > 0 && (
                                    <div className={s.solidBar} style={{ width: `${seg3Solid}%` }} />
                                )}
                                {seg3Dashed > 0 && (
                                    <div className={s.dashedLine} style={{ left: `${seg3DashedLeft}%`, width: `${seg3Dashed}%` }} />
                                )}
                            </div>
                            <div className={`${s.dot} ${s.lastDot} ${dot4Active ? s.active : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Checkpoint labels positioned under each dot */}
                <div className={s.checkpointsWrapper}>
                    <div className={`${s.checkpoint} ${s.firstCheckpoint}`}>
                        <span className={`${s.checkpointTitle} ${dot1Active ? s.titleActive : ''}`}>Создано</span>
                        <span className={s.checkpointDate}>
                            {formatDate(prediction.created)}
                        </span>
                    </div>

                    <div className={`${s.checkpoint} ${s.checkpoint2}`}>
                        <span className={`${s.checkpointTitle} ${dot2Active ? s.titleActive : ''}`}>Закрытие ставок</span>
                        <span className={s.checkpointDate}>
                            {formatDate(prediction.bet_date)}
                        </span>
                    </div>

                    <div className={`${s.checkpoint} ${s.checkpoint3}`}>
                        <span className={`${s.checkpointTitle} ${dot3Active ? s.titleActive : ''}`}>Окончание</span>
                        <span className={s.checkpointDate}>
                            {formatDate(prediction.end_date)}
                        </span>
                    </div>

                    <div className={`${s.checkpoint} ${s.lastCheckpoint}`}>
                        <span className={`${s.checkpointTitle} ${dot4Active ? s.titleActive : ''}`}>Выплата</span>
                        {prediction.closed && (
                            <span className={s.checkpointDate}>
                                {formatDate(prediction.closed)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}