import style from './filter.module.scss'
import { useContext, useState } from 'react'
import { AppContext } from '../../context/application/appContext'
import { IWsFilterConfig } from '../../model'
import { ChannelContext } from '../../context/channel/channelContext'
import Select from '../../elements/select'

export default function ModalFilter({ config, close }: { config: IWsFilterConfig; close: Function }) {
  const { setFilter } = useContext(ChannelContext)
  const [cfg, setCfg] = useState<IWsFilterConfig>(config)

  const setValue = (name: string, value: string | undefined) => {
    setCfg({ ...cfg, [name]: value === undefined ? null : value })
  }

  const reset = () => {
    setFilter({ gender: '', country: null })
    close()
  }
  const save = () => {
    setFilter(cfg)
    close()
  }

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>I want to talk with</h1>
      <div className={style.section}>
        <Gender gender={cfg.gender} setValue={setValue} />
      </div>
      <div className={style.section}>
        <Country country={cfg.country} setValue={setValue} />
      </div>
      <div className={style.section}>
        <div className='row center justify'>
          <button className='btn outline gray' onClick={reset}>
            Reset
          </button>
          <button className='btn green' onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const Gender = ({ gender, setValue }: { gender: string; setValue: Function }) => {
  const genders = [
    { value: '', name: 'Any' },
    { value: 'MALE', name: 'Male' },
    { value: 'FEMALE', name: 'Female' },
  ]
  const change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('gender', event.target.value)
  }

  return (
    <div className='row center'>
      <label className={style.label}>Gender</label>
      <Select options={genders} selected={gender} onChange={change} />
    </div>
  )
}

const Country = ({ country, setValue }: { country: string | null; setValue: Function }) => {
  const { countries } = useContext(AppContext)
  const anyCountry = { value: '-', name: 'Any' }
  const countriesList = [anyCountry, ...countries.map((country) => ({ value: country.code, name: country.name }))]

  const change = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('country', event.target.value)
  }

  return (
    <div className='row center'>
      <label className={style.label}>Country</label>
      <Select options={countriesList} selected={country || '-'} onChange={change} />
    </div>
  )
}
