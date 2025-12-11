import style from './profile.module.scss'
import { useContext, useEffect, useState } from 'react'
import { IAuthUser } from '../../model'
import { AppContext } from '../../context/application/appContext'
import Select from '../../elements/select'
import DropzoneAuto from '../../elements/dropzone'
import InputSwitch from '../../elements/input-switch'
import { ageOver18 } from '../../hooks'

interface ModalProfileProps {
  user: IAuthUser
}

export default function ModalProfile({ user }: ModalProfileProps) {
  const apvOn = ageOver18(user.birthday)

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Edit your profile</h1>
      <div className={style.section}>
        <Avatar avatar={user.avatar} />
      </div>
      <div className={style.section}>
        <ChannelName channel={user.username} />
        <DisplayName name={user.name} />
      </div>
      <div className={style.section}>
        <Birthday birthday={user.birthday} />
        <Gender gender={user.gender} />
      </div>
      {apvOn && <Switchers is_adult={user.is_adult} is_profanity={user.is_profanity} is_violence={user.is_violence} />}
      <div className={style.section}>
        <Country country={user.country || undefined} />
        <Language language={user.language || undefined} />
      </div>
    </div>
  )
}

const Avatar = ({ avatar }: { avatar: string }) => {
  return (
    <div className='row center'>
      <label className={style.avatar}>
        <img src={avatar} alt='ava' />
      </label>
      <DropzoneAuto imageType='avatar' imageSrc={avatar} />
    </div>
  )
}

const ChannelName = ({ channel }: { channel: string }) => {
  const { updateUser } = useContext(AppContext)
  const [value, setValue] = useState<string>(channel)
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setError(false)
  }

  useEffect(() => {
    let timer: any = null
    if (!/^[a-zA-Z0-9-_]{0,30}$/.test(value)) setError(true)
    else if (value.length > 5 && value !== channel) {
      timer = setTimeout(() => {
        updateUser({ username: value }).then((result) => {
          setError(!result)
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [value])

  const border = error ? `border error` : success ? `border success` : 'border'
  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Channel name</label>
        <input type='text' value={value} className={border} onChange={change} />
      </div>
      <div className='row center'>
        <div className={style.label} />
        {!error && <div className={style.help}>This name will be used in your channel URL</div>}
        {error && <div className={style.error}>Channel name must contains from 6 to 30 latin letters or diggits</div>}
      </div>
    </div>
  )
}

const DisplayName = ({ name }: { name: string }) => {
  const { updateUser } = useContext(AppContext)
  const [value, setValue] = useState<string>(name)
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setError(false)
  }

  useEffect(() => {
    let timer: any = null
    if (!/^[^@#№"^$%^&*=+{}[\]()<>.,;:!?|/\\]{0,}$/.test(value)) setError(true)
    else if (value.length > 4 && value !== name) {
      timer = setTimeout(() => {
        updateUser({ name: value }).then((result) => {
          setError(!result)
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [value])

  const border = error ? `border error` : success ? `border success` : 'border'
  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Display name</label>
        <input type='text' value={value} className={border} onChange={change} />
      </div>
      <div className='row center'>
        <div className={style.label} />
        {!error && <div className={style.help}>This name will be displayed for other users</div>}
        {error && <div className={style.error}>Special characters not allowed</div>}
      </div>
    </div>
  )
}

const Birthday = ({ birthday }: { birthday: string | null }) => {
  const { updateUser } = useContext(AppContext)
  const date = birthday ? new Date(birthday) : undefined
  const [day, setDay] = useState<number | undefined>(date?.getDate())
  const [month, setMonth] = useState<number | undefined>(date?.getMonth())
  const [year, setYear] = useState<number | undefined>(date?.getFullYear())
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const months = [
    { value: 0, name: 'January' },
    { value: 1, name: 'February' },
    { value: 2, name: 'March' },
    { value: 3, name: 'April' },
    { value: 4, name: 'May' },
    { value: 5, name: 'June' },
    { value: 6, name: 'July' },
    { value: 7, name: 'August' },
    { value: 8, name: 'September' },
    { value: 9, name: 'October' },
    { value: 10, name: 'November' },
    { value: 11, name: 'December' },
  ]

  const validate = (): boolean => {
    if (day !== undefined && (day < 0 || day > 31)) return false
    if (year !== undefined && (year < 0 || year > 2024)) return false
    if (Number(year) > 999 && Number(month) >= 0 && Number(day) >= 0) {
      const monthDays = new Date(year || 0, (month || 0) + 1, 0).getDate()
      if ((day || 0) > monthDays) return false
    }
    return true
  }

  const changeDay = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) setDay(Number(event.target.value))
    else setDay(undefined)
  }
  const changeMonth = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(Number(event.target.value))
  }
  const changeYear = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) setYear(Number(event.target.value))
    else setYear(undefined)
  }
  useEffect(() => {
    setError(false)
    let timer: any
    const same = day === date?.getDate() && month === date?.getMonth() && year === date?.getFullYear()
    const valid = /^[0-9]{1,2}$/.test(`${day}`) && /^[0-9]{1,2}$/.test(`${month}`) && /^[0-9]{4}$/.test(`${year}`)
    if (!validate()) setError(true)
    else if (!same && valid) {
      timer = setTimeout(() => {
        const _day = String(day).padStart(2, '0')
        const _month = String((month || 0) + 1).padStart(2, '0')
        updateUser({ birthday: `${year}-${_month}-${_day}` }).then((result) => {
          setError(!result)
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [day, month, year])

  const border = error ? `border error` : success ? `border success` : 'border'
  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Birthday date</label>
        <input type='number' placeholder='day' className={border} maxLength={2} onChange={changeDay} value={day} />
        &nbsp;&nbsp;&nbsp;
        <Select
          options={months}
          placeholder='Month'
          onChange={changeMonth}
          error={error}
          success={success}
          selected={month}
        />
        &nbsp;&nbsp;&nbsp;
        <input type='number' placeholder='year' className={border} maxLength={4} onChange={changeYear} value={year} />
      </div>
      <div className='row center'>
        <div className={style.label} />
        {error && <div className={style.error}>Invalid date</div>}
      </div>
    </div>
  )
}

const Gender = ({ gender }: { gender: string | undefined }) => {
  const { updateUser } = useContext(AppContext)
  const [value, setValue] = useState<string | undefined>(gender)
  const [success, setSuccess] = useState<boolean>(false)
  const genders = [
    { value: 'MALE', name: 'Male' },
    { value: 'FEMALE', name: 'Female' },
  ]
  const change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value)
  }
  useEffect(() => {
    let timer: any = null
    if (value && value !== gender) {
      timer = setTimeout(() => {
        updateUser({ gender: value }).then((result) => {
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [value])

  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Gender</label>
        <Select placeholder='Gender' options={genders} selected={value} onChange={change} success={success} />
      </div>
    </div>
  )
}

interface APV {
  is_adult: number
  is_profanity: number
  is_violence: number
}

const Switchers = ({ is_adult, is_profanity, is_violence }: APV) => {
  const { updateUser } = useContext(AppContext)
  const [apv, setApv] = useState<APV>({ is_adult, is_profanity, is_violence })

  const change = (name: string, value: boolean) => {
    setApv({ ...apv, [name]: value ? 1 : 0 })
    updateUser({ [name]: value ? 1 : 0 })
  }

  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>18+ content</label>
        <div className={style.switchers}>
          <InputSwitch
            name='is_adult'
            title='Adult'
            value={apv.is_adult > 0}
            disabled={is_adult > 1}
            onChange={change}
          />
          <InputSwitch
            name='is_profanity'
            title='Profanity'
            value={apv.is_profanity > 0}
            disabled={is_profanity > 1}
            onChange={change}
          />
          <InputSwitch
            name='is_violence'
            title='Violence'
            value={apv.is_violence > 0}
            disabled={is_violence > 1}
            onChange={change}
          />
        </div>
      </div>
    </div>
  )
}

const Country = ({ country }: { country: string | undefined }) => {
  const { countries, updateUser } = useContext(AppContext)
  const [value, setValue] = useState<string | undefined>(country)
  const [success, setSuccess] = useState<boolean>(false)
  const countriesList = countries.map((country) => ({ value: country.code, name: country.name }))
  const change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value)
  }
  useEffect(() => {
    let timer: any = null
    if (value && value !== country) {
      timer = setTimeout(() => {
        updateUser({ country: value }).then((result) => {
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              console.log('Country success')

              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [value])

  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Country</label>
        <Select placeholder='Country' options={countriesList} selected={value} onChange={change} success={success} />
      </div>
    </div>
  )
}

const Language = ({ language }: { language: string | undefined }) => {
  const { languages, updateUser } = useContext(AppContext)
  const [value, setValue] = useState<string | undefined>(language)
  const [success, setSuccess] = useState<boolean>(false)
  const languagesList = languages.map((language) => ({ value: language.code, name: language.name }))
  const change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value)
  }
  useEffect(() => {
    let timer: any = null
    if (value && value !== language) {
      timer = setTimeout(() => {
        updateUser({ language: value }).then((result) => {
          if (result) {
            setSuccess(true)
            setTimeout(() => {
              setSuccess(false)
            }, 4000)
          }
        })
      }, 2000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line
  }, [value])

  return (
    <div className={style.row}>
      <div className='row center'>
        <label className={style.label}>Language</label>
        <Select placeholder='Language' options={languagesList} selected={value} onChange={change} success={success} />
      </div>
    </div>
  )
}
