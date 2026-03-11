import style from './deposit.module.scss'
import QRCodeSvg from '../../components/QRCode'
import { useEffect, useState } from 'react'
import { useAppSelector } from '../../hooks/useRedux'
import { useDepositMutation } from '../../services/api'
import IconSprite from '../../elements/icon/Icon'
import { useModalContext } from '../../services/ModalContext'
import solanaLogo from '../../assets/solana.svg'
import etheriumLogo from '../../assets/etherium.svg'
import bscLogo from '../../assets/bsc.svg'
import polygonLogo from '../../assets/polygon.svg'
import tronLogo from '../../assets/tron.svg'

const CHAINS = [
  { value: 'ETH', label: 'ETH', logo: etheriumLogo },
  { value: 'BNB', label: 'BNB', logo: bscLogo },
  { value: 'SOL', label: 'SOL', logo: solanaLogo },
  { value: 'MATIC', label: 'MATIC', logo: polygonLogo },
  { value: 'TRX', label: 'TRX', logo: tronLogo },
]

const ADDRESSES = {
  ETH: '0x1234567890123456789012345678901234567890',
  BTC: '0x2234567890123456789012345678901234567890',
  BNB: '0x3234567890123456789012345678901234567890',
  SOL: '0x4234567890123456789012345678901234567890',
  ADA: '0x5234567890123456789012345678901234567890',
  MATIC: '0x6234567890123456789012345678901234567890',
  XRP: '0x7234567890123456789012345678901234567890',
  DOGE: '0x8234567890123456789012345678901234567890',
  TRX: '0x9234567890123456789012345678901234567890',
  LTC: '0x0234567890123456789012345678901234567890',
}

export default function ModalDeposit() {
  const { setCloseOutside } = useModalContext()

  useEffect(() => {
    setCloseOutside(true)
  }, [setCloseOutside])

  const user = useAppSelector((state) => state.auth.user)
  const [deposit] = useDepositMutation()
  const [chain, setChain] = useState('TRX')
  const [address, setAddress] = useState(ADDRESSES['TRX'])
  const [isCopied, setIsCopied] = useState(false)

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChain = e.target.value as keyof typeof ADDRESSES
    setChain(selectedChain)
    setAddress(ADDRESSES[selectedChain])
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
    if (address === ADDRESSES['ETH']) deposit()

    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={`${style.wrapper} noscroll`}>
      <h1>Депозит {user?.username}</h1>
      <hr />
      <div className='column center gap12'>
        <div>Отправьте USDT или USDC на указанный адрес в выбранном блокчейне</div>
        <select className='outline' name='chain' value={chain} onChange={handleChainChange}>
          {CHAINS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <QRCodeSvg text={address} size={240} logoUrl={CHAINS.find((c) => c.value === chain)?.logo} />
        <div className={style.address} onClick={handleCopy}>
          <span>{address}</span>
          <button>
            <IconSprite name='copy' size={20} />
          </button>
          {/* {isCopied && <div className={`${style.copied}${isCopied ? ' active' : ''}`}>Скопировано</div>} */}
          <div className={`${style.copied}${isCopied ? ' active' : ''}`}>Скопировано</div>
        </div>
        <div className={style.rules}>
          <div>Минимальный депозит 5 USDT</div>
          <div>Зачисление происходит в течение 2 минут</div>
        </div>
      </div>
    </div>
  )
}
