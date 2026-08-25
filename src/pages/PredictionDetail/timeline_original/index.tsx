import styles from './timeline.module.scss'
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

const formatRemainingTime = (targetMs: number, nowMs: number): string => {
    const diff = targetMs - nowMs
    if (diff <= 0) return ''

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    const parts: string[] = []
    if (days > 0) {
        const dayWord = days === 1 ? 'день' : days >= 2 && days <= 4 ? 'дня' : 'дней'
        parts.push(`${days} ${dayWord}`)
    }
    if (hours > 0 || days > 0) {
        const hourWord = hours === 1 ? 'час' : hours >= 2 && hours <= 4 ? 'часа' : 'часов'
        parts.push(`${hours} ${hourWord}`)
    }
    const minWord = minutes === 1 ? 'минута' : minutes >= 2 && minutes <= 4 ? 'минуты' : 'минут'
    parts.push(`${minutes} ${minWord}`)

    return `Осталось ${parts.join(' ')}`
}

export const PredictionTimeLine = ({ prediction }: { prediction: IPredictionDetail }) => {
    const [now, setNow] = useState<number>(() => Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)
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

    // Countdown text
    let countdownText = ''
    if (isEnded) {
        countdownText = 'Предсказание завершено'
    } else if (now < tBet) {
        countdownText = formatRemainingTime(tBet, now) || 'Ставки завершаются'
    } else if (now < tEnd) {
        countdownText = formatRemainingTime(tEnd, now) || 'Событие завершается'
    } else {
        countdownText = 'Подведение итогов'
    }

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
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.badge}>ПРОГРЕСС</span>
                <span className={styles.countdown}>{countdownText}</span>
            </div>

            <div className={styles.timelineArea}>
                <div className={styles.segmentsRow}>
                    {/* Segment 1 */}
                    <div className={styles.segment}>
                        <span className={styles.segmentLabel}>ПРИЕМ СТАВОК</span>
                        <div className={styles.trackWrapper}>
                            <div className={`${styles.dot} ${dot1Active ? styles.dotActive : ''}`} />
                            <div className={styles.trackLine}>
                                {seg1Solid > 0 && (
                                    <div className={styles.solidBar} style={{ width: `${seg1Solid}%` }} />
                                )}
                                {seg1Dashed > 0 && (
                                    <div
                                        className={styles.dashedLine}
                                        style={{ left: `${seg1DashedLeft}%`, width: `${seg1Dashed}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segment 2 */}
                    <div className={styles.segment}>
                        <span
                            className={`${styles.segmentLabel} ${now < tBet && !isEnded ? styles.labelPending : ''
                                }`}
                        >
                            ОЖИДАНИЕ СОБЫТИЯ
                        </span>
                        <div className={styles.trackWrapper}>
                            <div className={`${styles.dot} ${dot2Active ? styles.dotActive : ''}`} />
                            <div className={styles.trackLine}>
                                {seg2Solid > 0 && (
                                    <div className={styles.solidBar} style={{ width: `${seg2Solid}%` }} />
                                )}
                                {seg2Dashed > 0 && (
                                    <div
                                        className={styles.dashedLine}
                                        style={{ left: `${seg2DashedLeft}%`, width: `${seg2Dashed}%` }}
                                    />
                                )}
                                {now < tBet && !isEnded && <div className={styles.dashedLineMuted} />}
                            </div>
                        </div>
                    </div>

                    {/* Segment 3 */}
                    <div className={styles.segment}>
                        <span
                            className={`${styles.segmentLabel} ${now < tEnd && !isEnded ? styles.labelPending : ''
                                }`}
                        >
                            ПОДВЕДЕНИЕ ИТОГОВ
                        </span>
                        <div className={styles.trackWrapper}>
                            <div className={`${styles.dot} ${dot3Active ? styles.dotActive : ''}`} />
                            <div className={styles.trackLine}>
                                {seg3Solid > 0 && (
                                    <div className={styles.solidBar} style={{ width: `${seg3Solid}%` }} />
                                )}
                                {seg3Dashed > 0 && (
                                    <div
                                        className={styles.dashedLine}
                                        style={{ left: `${seg3DashedLeft}%`, width: `${seg3Dashed}%` }}
                                    />
                                )}
                                {now < tEnd && !isEnded && <div className={styles.dashedLineMuted} />}
                            </div>
                            <div
                                className={`${styles.dot} ${styles.lastDot} ${dot4Active ? styles.dotActive : ''
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Checkpoint labels positioned under each dot */}
                <div className={styles.checkpointsWrapper}>
                    <div className={`${styles.checkpoint} ${styles.firstCheckpoint}`}>
                        <span
                            className={`${styles.checkpointTitle} ${dot1Active ? styles.titleActive : ''
                                }`}
                        >
                            Создано
                        </span>
                        <span className={styles.checkpointDate}>
                            {formatDate(prediction.created)}
                        </span>
                    </div>

                    <div className={`${styles.checkpoint} ${styles.checkpoint2}`}>
                        <span
                            className={`${styles.checkpointTitle} ${dot2Active ? styles.titleActive : ''
                                }`}
                        >
                            Конец ставок
                        </span>
                        <span className={styles.checkpointDate}>
                            {formatDate(prediction.bet_date)}
                        </span>
                    </div>

                    <div className={`${styles.checkpoint} ${styles.checkpoint3}`}>
                        <span
                            className={`${styles.checkpointTitle} ${dot3Active ? styles.titleActive : ''
                                }`}
                        >
                            Окончание
                        </span>
                        <span className={styles.checkpointDate}>
                            {formatDate(prediction.end_date)}
                        </span>
                    </div>

                    <div className={`${styles.checkpoint} ${styles.lastCheckpoint}`}>
                        <span
                            className={`${styles.checkpointTitle} ${dot4Active ? styles.titleActive : ''
                                }`}
                        >
                            Выплата
                        </span>
                        {prediction.closed && (
                            <span className={styles.checkpointDate}>
                                {formatDate(prediction.closed)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}