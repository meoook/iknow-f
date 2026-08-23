import style from './deposit.module.scss'
import QRCodeSvg from '../../components/QRCode'
import { useEffect, useState } from 'react'
import { useGetDepositParamsQuery } from '../../services/api'
import { useModalContext } from '../../services/ModalContext'
import IconSprite from '../../elements/icon'
import Loader from '../../elements/loader'
import Empty from '../../elements/empty'
import solanaLogo from '../../assets/solana.svg'
import etheriumLogo from '../../assets/etherium.svg'
import bscLogo from '../../assets/bsc.svg'
import polygonLogo from '../../assets/polygon.svg'
import tronLogo from '../../assets/tron.svg'

const getLogo = (chainName: string) => {
  const name = chainName.toUpperCase()
  if (name.includes('ETH') || name.includes('ETHER')) return etheriumLogo
  if (name.includes('BSC') || name.includes('BNB') || name.includes('BINANCE')) return bscLogo
  if (name.includes('SOL')) return solanaLogo
  if (name.includes('POL') || name.includes('POLYGON')) return polygonLogo
  if (name.includes('TRX') || name.includes('TRON')) return tronLogo
  return undefined
}

export default function ModalDeposit() {
  const { setCloseOutside } = useModalContext()
  const { data: depositParams = [], isLoading, isError } = useGetDepositParamsQuery()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    setCloseOutside(true)
  }, [setCloseOutside])

  // Select the first token key by default when data loads
  useEffect(() => {
    if (depositParams.length > 0 && selectedKey === null) {
      const first = depositParams[0]
      setSelectedKey(`${first.chain_name}_${first.currency}`)
    }
  }, [depositParams, selectedKey])

  const selectedToken = depositParams.find(
    (t) => `${t.chain_name}_${t.currency}` === selectedKey
  )

  const handleCopy = () => {
    if (!selectedToken) return
    navigator.clipboard.writeText(selectedToken.address)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className={style.wrapper}>
        <h1>Депозит</h1>
        <hr />
        <div className='column center pv-4 gap-2'>
          <Loader />
          <span className='text-sm secondary'>Загрузка вариантов оплаты...</span>
        </div>
      </div>
    )
  }

  if (isError || depositParams.length === 0) {
    return (
      <div className={style.wrapper}>
        <h1>Депозит</h1>
        <hr />
        <Empty title='Пополнение временно недоступно' size={20} />
      </div>
    )
  }

  const activeToken = selectedToken || depositParams[0]
  const currentLogo = getLogo(activeToken.chain_name)

  return (
    <div className={`${style.wrapper} noscroll`}>
      <h1>Депозит</h1>
      <hr />
      <div className='column center gap-3'>
        <div>Отправьте {activeToken.currency} на указанный адрес в выбранном блокчейне</div>
        <select
          className='outline'
          name='chain'
          value={selectedKey || ''}
          onChange={(e) => setSelectedKey(e.target.value)}>
          {depositParams.map((token) => {
            const key = `${token.chain_name}_${token.currency}`
            return (
              <option key={key} value={key}>
                {token.currency} ({token.chain_name})
              </option>
            )
          })}
        </select>
        <QRCodeSvg text={activeToken.address} size={240} logoUrl={currentLogo} />
        <div className={style.address} onClick={handleCopy}>
          <span>{activeToken.address}</span>
          <button type='button'>
            <IconSprite name='copy' size={20} />
          </button>
          <div className={`${style.copied}${isCopied ? ' active' : ''}`}>Скопировано</div>
        </div>
        <div className={style.rules}>
          <div>Минимальный депозит {activeToken.minimum} {activeToken.currency}</div>
          <div>Зачисление происходит в течение 2 минут</div>
        </div>
      </div>
    </div>
  )
}
