import s from './withdraw.module.scss'
import { useEffect, useMemo, useState } from 'react'
import { useGetDepositParamsQuery, useWithdrawNonceMutation, useWithdrawMutation } from '../../services/api'
import { useModalContext } from '../../services/ModalContext'
import { useAppSelector } from '../../hooks/useRedux'
import type { IDepositParam } from '../../types/app.types'
import { web3AuthService } from '../../services/web3Auth'
import IconSprite from '../../elements/icon'
import Loader from '../../elements/loader'
import Empty from '../../elements/empty'
import Nonce from '../../elements/nonce'
import solanaLogo from '../../assets/solana.svg'
import etheriumLogo from '../../assets/etherium.svg'
import bscLogo from '../../assets/bsc.svg'
import polygonLogo from '../../assets/polygon.svg'
import tronLogo from '../../assets/tron.svg'

const getLogo = (chainName: string) => {
  const name = chainName.toUpperCase()
  if (name.includes('ETH')) return etheriumLogo
  if (name.includes('BSC')) return bscLogo
  if (name.includes('SOL')) return solanaLogo
  if (name.includes('POL')) return polygonLogo
  if (name.includes('TRON')) return tronLogo
  return undefined
}

export default function ModalWithdraw() {
  const { setCloseOutside, closeModal } = useModalContext()
  const { user } = useAppSelector((state) => state.auth)
  const userBalance = user?.balance ?? 0

  const { data: depositParams = [], isLoading, isError } = useGetDepositParamsQuery()
  const [withdrawNonce, { isLoading: isRequestingNonce }] = useWithdrawNonceMutation()
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation()

  const [step, setStep] = useState<'form' | 'confirm' | 'nonce' | 'success'>('form')
  const [selectedChainName, setSelectedChainName] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [serverError, setServerError] = useState<string | null>(null)

  // Nonce confirmation state
  const [nonce, setNonce] = useState<string>('')
  const [targetEmail, setTargetEmail] = useState<string>('')
  const [expireTime, setExpireTime] = useState<number | null>(null)
  const [expired, setExpired] = useState<boolean>(false)
  const [remainingSec, setRemainingSec] = useState<number>(0)

  // Закрывать модалку ТОЛЬКО по крестику
  useEffect(() => {
    setCloseOutside(false)
  }, [setCloseOutside])

  // Countdown timer for nonce step
  useEffect(() => {
    if (step === 'nonce' && expireTime) {
      const update = () => {
        const sec = Math.max(0, expireTime - Math.floor(Date.now() / 1000))
        setRemainingSec(sec)
        if (sec <= 0) setExpired(true)
      }
      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }
  }, [step, expireTime])

  // Список уникальных блокчейнов без дубликатов
  const chains = useMemo(() => {
    const map = new Map<string, IDepositParam>()
    for (const item of depositParams) {
      if (!map.has(item.chain_name)) map.set(item.chain_name, item)
    }
    return Array.from(map.values())
  }, [depositParams])

  const selectedChain = useMemo(() => {
    if (selectedChainName) return chains.find((c) => c.chain_name === selectedChainName) || chains[0]
    return chains[0]
  }, [chains, selectedChainName])

  // Обработка ввода суммы
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(',', '.')
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val)
      setServerError(null)
    }
  }

  // Быстрые кнопки добавления суммы
  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0
    const nextVal = Math.min(userBalance, Math.max(0, current + addVal))
    setAmount(nextVal > 0 ? nextVal.toFixed(2).replace(/\.?0+$/, '') : '')
    setServerError(null)
  }

  const handleSetMaxAmount = () => {
    setAmount(userBalance > 0 ? userBalance.toFixed(2).replace(/\.?0+$/, '') : '')
    setServerError(null)
  }

  const numAmount = parseFloat(amount) || 0
  const minWithdraw = selectedChain?.minimum ?? 1
  const isAmountPositive = numAmount > 0
  const hasEnoughBalance = numAmount <= userBalance
  const meetsMinimum = numAmount >= minWithdraw
  const isAddressFilled = address.trim().length >= 8

  const isFormValid = isAmountPositive && hasEnoughBalance && meetsMinimum && isAddressFilled

  // Запрос подтверждения вывода (Шаг confirm -> nonce или Web3 подпись)
  const handleRequestWithdraw = async () => {
    if (!isFormValid || !selectedChain) return
    setServerError(null)
    try {
      const res = await withdrawNonce({
        chain_name: selectedChain.chain_name,
        amount: numAmount,
        address: address.trim(),
      }).unwrap()

      if (res.method === 'email') {
        setTargetEmail(res.email || '')
        setExpireTime(res.expire)
        setExpired(false)
        setNonce('')
        setStep('nonce')
      } else if (res.method === 'web3') {
        if (!user?.address) {
          setServerError('Кошелек пользователя не найден')
          return
        }
        if (!res.message) {
          setServerError('Сообщение для подписи не получено')
          return
        }
        try {
          const signature = await web3AuthService.signMessage(user.address, res.message)
          await withdraw({ signature }).unwrap()
          setStep('success')
        } catch {
          setServerError('Ошибка подтверждения вывода')
        }
      }
    } catch {
      setServerError('Ошибка при создании запроса на вывод')
    }
  }

  // Подтверждение по Email OTP (Шаг nonce)
  const handleConfirmEmailWithdraw = async () => {
    if (nonce.length !== 6) return
    setServerError(null)
    try {
      await withdraw({ nonce }).unwrap()
      setStep('success')
    } catch {
      setServerError('Неверный код подтверждения')
    }
  }

  // Повторная отправка кода
  const handleResendNonce = async () => {
    if (!selectedChain) return
    setServerError(null)
    setExpired(false)
    try {
      const res = await withdrawNonce({
        chain_name: selectedChain.chain_name,
        amount: numAmount,
        address: address.trim(),
      }).unwrap()
      setExpireTime(res.expire)
      setNonce('')
    } catch {
      setServerError('Не удалось повторно отправить код')
    }
  }

  const formatRemainingTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (isLoading) {
    return (
      <div className={s.wrapper}>
        <div className={s.header}>
          <h1>Вывод средств</h1>
        </div>
        <hr />
        <div className='column center pv-4 gap-2'>
          <Loader />
          <span className='text-sm secondary'>Загрузка параметров вывода...</span>
        </div>
      </div>
    )
  }

  if (isError || chains.length === 0) {
    return (
      <div className={s.wrapper}>
        <div className={s.header}>
          <h1>Вывод средств</h1>
        </div>
        <hr />
        <Empty title='Вывод временно недоступен' size={20} />
      </div>
    )
  }

  const currentLogo = selectedChain ? getLogo(selectedChain.chain_name) : undefined

  return (
    <div className={`${s.wrapper} noscroll`}>
      {/* Шаг 1: Форма ввода */}
      {step === 'form' && (
        <>
          <h1>Вывод средств</h1>
          <hr />

          <div className='column gap-3'>
            {/* Выбор блокчейна */}
            <div className='column gap-1'>
              <div className='text-sm secondary'>Блокчейн</div>
              <select
                className='select outline'
                name='chain'
                value={selectedChainName || ''}
                onChange={(e) => {
                  setSelectedChainName(e.target.value)
                  setServerError(null)
                }}>
                {chains.map((chain) => (
                  <option key={chain.chain_name} value={chain.chain_name}>
                    {chain.chain_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Поле ввода суммы */}
            <div className='column gap-1'>
              <div className='row center justify text-sm secondary gap-3'>
                <span>Сумма вывода</span>
                <span className='color-brand'>Доступно: ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className={s.input}>
                <span className={s.prefix}>$</span>
                <input
                  type='text'
                  className='outline'
                  inputMode='decimal'
                  placeholder={`Минимум ${minWithdraw.toFixed(2)}`}
                  value={amount}
                  onChange={handleAmountChange}
                />
                {amount && <button className={s.reset} onClick={() => setAmount('')}><IconSprite name='close' size={20} /></button>}
              </div>

              <div className='row center gap-2'>
                {/* Подсказки и ошибки валидации суммы */}
                {numAmount > userBalance && (
                  <div className='text-sm color-red'>Недостаточно средств на балансе</div>
                )}
                {isAmountPositive && !meetsMinimum && (
                  <div className='text-sm color-red'>Минимальная сумма вывода: ${minWithdraw}</div>
                )}
                {/* Быстрые кнопки */}
                <div className='row gap-2 grow justify-end'>
                  <button type='button' className='chip hover' onClick={() => handleAddAmount(10)}>+$10</button>
                  <button type='button' className='chip hover' onClick={() => handleAddAmount(100)}>+$100</button>
                  <button type='button' className='chip hover' onClick={handleSetMaxAmount}>Max</button>
                </div>
              </div>
            </div>

            {/* Поле ввода адреса */}
            <div className='column gap-1'>
              <div className='text-sm secondary'>Адрес получателя</div>
              <input
                type='text'
                className='outline'
                placeholder={`Введите ваш ${selectedChain.chain_name} адрес`}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setServerError(null)
                }}
              />
            </div>

            {serverError && <div className='alert-red bdr text-sm ph-3 pv-2'>{serverError}</div>}

            <button
              className='btn blue mid w-full'
              disabled={!isFormValid}
              onClick={() => {
                setServerError(null)
                setStep('confirm')
              }}>
              Продолжить
            </button>
          </div>
        </>
      )}

      {/* Шаг 2: Предпросмотр */}
      {step === 'confirm' && (
        <>
          <div className='row center gap-4 pb-1'>
            <button className='btn btn-icon' onClick={() => setStep('form')} title='Назад'>
              <IconSprite name='arrow_back' size={20} />
            </button>
            <h1>Подтверждение вывода</h1>
          </div>

          <div className='column gap-3'>
            <div className='column bg-card bd bdr p-4 gap-3 text-sm'>
              <div className='row center justify'>
                <div className='secondary'>Блокчейн</div>
                <div className='row end gap-2 w-500 primary'>
                  {currentLogo && <img src={currentLogo} alt='' className={s.logo} />}
                  <span>{selectedChain.chain_name}</span>
                </div>
              </div>

              <div className='row center justify'>
                <span className='secondary'>Сумма к выводу</span>
                <span className='w-500 primary'>${numAmount.toFixed(2)}</span>
              </div>

              <div className='row center justify'>
                <span className='secondary'>Остаток на балансе</span>
                <span className='w-500 primary'>${Math.max(0, userBalance - numAmount).toFixed(2)}</span>
              </div>

              <div className='column gap-1'>
                <span className='secondary'>Адрес получателя</span>
                <div className={s.address}>{address.trim()}</div>
                <div className='alert-orange p-2 bdr-6 text-xs'>Пожалуйста проверьте внимательно адрес получателя</div>
              </div>
            </div>

            {serverError && <div className='alert-red bdr text-sm ph-3 pv-2'>{serverError}</div>}

            <div className='row gap-4'>
              <button
                className='btn gray mid w-full'
                onClick={() => setStep('form')}
                disabled={isRequestingNonce || isWithdrawing}>
                Назад
              </button>
              <button
                className='btn blue mid w-full'
                onClick={handleRequestWithdraw}
                disabled={isRequestingNonce || isWithdrawing}>
                {isRequestingNonce || isWithdrawing ? 'Подготовка...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Шаг 2.5: Подтверждение по почте (OTP Nonce) */}
      {step === 'nonce' && (
        <>
          <div className='row center gap-4 pb-1'>
            <button className='btn btn-icon' onClick={() => setStep('confirm')} title='Назад'>
              <IconSprite name='arrow_back' size={20} />
            </button>
            <h1>Подтверждение кода</h1>
          </div>

          <div className='column gap-4'>
            <div className='column bg-card bd bdr p-4 gap-2 text-center'>
              <span className='secondary text-sm'>
                Код подтверждения отправлен на почту:
              </span>
              <span className='w-600 primary text-sm'>{targetEmail}</span>
            </div>

            <div className='column center gap-3'>
              <Nonce
                length={6}
                value={nonce}
                onChange={(val) => {
                  setNonce(val)
                  setServerError(null)
                }}
              />

              <div className='row center justify w-full text-sm secondary'>
                {!expired && expireTime ? (
                  <span>
                    Код действителен: <strong className='primary'>{formatRemainingTime(remainingSec)}</strong>
                  </span>
                ) : (
                  <span className='color-red'>Срок действия кода истек</span>
                )}

                <button
                  type='button'
                  className='btn btn-text text-sm'
                  disabled={!expired && remainingSec > 60 || isRequestingNonce}
                  onClick={handleResendNonce}>
                  Отправить повторно
                </button>
              </div>
            </div>

            {serverError && <div className='alert-red bdr text-sm ph-3 pv-2'>{serverError}</div>}

            <div className='row gap-4'>
              <button
                className='btn gray mid w-full'
                onClick={() => setStep('confirm')}
                disabled={isWithdrawing}>
                Назад
              </button>
              <button
                className='btn blue mid w-full'
                onClick={handleConfirmEmailWithdraw}
                disabled={nonce.length !== 6 || isWithdrawing}>
                {isWithdrawing ? 'Проверка...' : 'Завершить вывод'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Шаг 3: Успех */}
      {step === 'success' && (
        <div className='column center text-center gap-5 pv-3'>
          <div className={s.icon}>
            <IconSprite name='check' size={32} />
          </div>
          <h2>Заявка создана!</h2>
          <p className='secondary text-sm lh-5'>
            Заявка на вывод <strong>${numAmount.toFixed(2)}</strong> в сети <strong>{selectedChain.chain_name}</strong> успешно отправлена.
            Средства поступят на указанный вами кошелек после обработки транзакции сетью.
          </p>
          <button className='btn blue mid w-full' onClick={closeModal}>
            Понятно
          </button>
        </div>
      )}
    </div>
  )
}
