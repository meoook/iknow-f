import style from './withdraw.module.scss'
import { useEffect, useState } from 'react'
import type { IUser } from '../../../types/auth.types'

export default function ProfileWithdraw({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [address, setAddress] = useState(user?.address || '')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (user?.address) setAddress(user.address)
  }, [user?.address])

  const handleWithdraw = () => {
    console.log(address, amount)
  }

  if (loading) {
    return (
      <>
        <h1>Вывод средств</h1>
        <div className={style.head}>
          <div className={`${style.avatar} shimmer`} />
          <div className={`${style.btn} shimmer`} />
        </div>
        {['Почта', 'Никнейм'].map((i) => (
          <div className='form-row' key={i}>
            <label>{i}</label>
            <div className={`${style.input} shimmer`} />
          </div>
        ))}
        <div className='form-row'>
          <label>О себе</label>
          <div className={`${style.textarea} shimmer`} />
        </div>
        <div className={`${style.btn} shimmer`} />
      </>
    )
  }
  return (
    <div className='column gap12'>
      <h1>Вывод средств</h1>
      <hr />
      <input
        name='address'
        type='text'
        className='outline'
        placeholder='Адрес кошелька'
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        name='amount'
        type='decimal'
        className='outline'
        placeholder='Сумма'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className='btn blue' onClick={handleWithdraw}>
        Вывести
      </button>
    </div>
  )
}
