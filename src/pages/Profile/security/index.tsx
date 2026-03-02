import style from './security.module.scss'
import type { IUser } from '../../../types/auth.types'

export default function ProfileSecurity({ user, loading }: { user: IUser | null; loading: boolean }) {
  if (loading) {
    return (
      <>
        <h1>Настройки профиля</h1>
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
      <h1>Настройки безопасности</h1>
      <hr />

      <div className={style.head}>В стадии разработки</div>
    </div>
  )
}
