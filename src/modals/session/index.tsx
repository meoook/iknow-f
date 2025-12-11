import style from './session.module.scss'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/application/appContext'
import { IAuthUser, ISessionCreate, IWsChannel } from '../../model'
import { ageOver18 } from '../../hooks'
import iconArray from '../../elements/ico-get/icons'
import InputSwitch from '../../elements/input-switch'
import InputTextArea from '../../elements/input-textarea'
import Dropzone from '../../elements/dropzone/dz'

interface APV {
  is_adult: number
  is_profanity: number
  is_violence: number
}

interface ModalProfileProps {
  user: IAuthUser
  channel: IWsChannel
}

export default function ModalSession({ user, channel }: ModalProfileProps) {
  const { addPopup, sessionCreate } = useContext(AppContext)
  const [name, setName] = useState<string>(`${user.username} stream`)
  const [dsc, setDsc] = useState<string>('')
  const [apv, setApv] = useState<APV>({
    is_adult: user.is_adult,
    is_profanity: user.is_profanity,
    is_violence: user.is_violence,
  })
  const [tags, setTags] = useState<string[]>(channel.tags)
  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState<number>(0)

  const tagAdd = (name: string) => {
    setTags([...tags, name])
  }
  const tagRemove = (name: string) => {
    setTags(tags.filter((t) => t !== name))
  }

  const create = async () => {
    // TODO: tags check
    const params: ISessionCreate = {
      title: name,
      description: dsc,
      tags,
      is_profanity: apv.is_profanity,
      is_violence: apv.is_violence,
      is_adult: apv.is_adult,
    }
    if (file) params['image'] = file
    const uploaded = await sessionCreate(params, setProgress)
    if (uploaded) addPopup({ text: `Session ${name} created`, title: 'Session started', type: 'success' })
    else addPopup({ text: `Session ${name} failed to creat`, title: 'Session not started', type: 'warning' })

    setTimeout(() => {
      setProgress(0)
      // TODO: close modal
    }, 5000)
  }

  const apvOn = ageOver18(user.birthday)

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Stream settings</h1>
      <div className={style.section}>
        <div className='row'>
          <label className={style.label}>Preview</label>
          <Dropzone resolution='440x250' setFile={setFile} progress={progress} />
        </div>
      </div>
      <SessionName name={name} setName={setName} />
      <SessionDescription dsc={dsc} setDsc={setDsc} />
      {apvOn && <Switchers apv={apv} setApv={setApv} />}
      <TagsList tags={tags} tagAdd={tagAdd} tagRemove={tagRemove} />
      <div className={style.section}>
        <button className='btn green' onClick={create}>
          Start
        </button>
      </div>
    </div>
  )
}

const SessionName = ({ name, setName }: { name: string; setName: Function }) => {
  const [value, setValue] = useState<string>(name)
  const [error, setError] = useState<boolean>(false)
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setError(false)
  }

  useEffect(() => {
    if (!/^[^@#№"^$%^&*=+{}[\]()<>.,;:!?|/\\]{6,}$/.test(value)) setError(true)
    else setName(value)
    // eslint-disable-next-line
  }, [value])

  const border = error ? `border error` : 'border'
  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>Stream name</label>
        <input type='text' value={value} className={border} onChange={change} />
      </div>
      <div className='row'>
        <div className={style.label} />
        {!error && <div className={style.help}>Your stream title</div>}
        {error && <div className={style.error}>Stream title must contains from 6 to 30 latin letters or diggits</div>}
      </div>
    </div>
  )
}

const SessionDescription = ({ dsc, setDsc }: { dsc: string; setDsc: Function }) => {
  const limit = 2000 // TODO: to env
  const regex = new RegExp(`^.{0,${limit}}$`)
  const [value, setValue] = useState<string>(dsc)
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<boolean>(false)

  const change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    setAmount(limit - event.target.value.length)
    if (regex.test(event.target.value)) setError(false)
  }

  useEffect(() => {
    setAmount(limit - value.length)
    if (!regex.test(value)) setError(true)
    else setDsc(value)
    // eslint-disable-next-line
  }, [value])

  const color = error ? 'red' : 'gray'
  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>Description</label>
        <InputTextArea value={value} color={color} ph={`Maximmum ${limit} symbols`} rows={3} onChange={change} />
      </div>
      <div className='row'>
        <div className={style.label} />
        <div className={style.row}>
          {!error && <div className={style.help}>Your stream description</div>}
          {error && <div className={style.error}>{limit} symbols limit reached</div>}
          <div className={style.help}>
            {amount} of {limit} left
          </div>
        </div>
      </div>
    </div>
  )
}

const Switchers = ({ apv, setApv }: { apv: APV; setApv: Function }) => {
  const change = (name: string, value: boolean) => {
    setApv({ ...apv, [name]: value ? 1 : 0 })
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
            disabled={apv.is_adult > 1}
            onChange={change}
          />
          <InputSwitch
            name='is_profanity'
            title='Profanity'
            value={apv.is_profanity > 0}
            disabled={apv.is_profanity > 1}
            onChange={change}
          />
          <InputSwitch
            name='is_violence'
            title='Violence'
            value={apv.is_violence > 0}
            disabled={apv.is_violence > 1}
            onChange={change}
          />
        </div>
      </div>
    </div>
  )
}

const TagsList = ({ tags, tagAdd, tagRemove }: { tags: string[]; tagAdd: Function; tagRemove: Function }) => {
  const limit = 4 // TODO: to env
  const [error, setError] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    if (error)
      setTimeout(() => {
        setError(false)
      }, 4000)
  }, [error])

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (error) setError(false)
  }
  const keyCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') add()
  }
  const add = () => {
    if (tags.length >= limit) setError(true)
    else tagAdd(value)
    setValue('')
  }

  const color = error ? 'border error' : 'border'
  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>Stream tags</label>
        <div className={style.row}>
          <input className={color} value={value} onKeyDown={keyCheck} onChange={handle} />
          <button className='btn green' onClick={add}>
            Add
          </button>
        </div>
      </div>
      <div className='row'>
        <label className={style.label} />
        {!error && <div className={style.help}>Stream tags ({limit} max)</div>}
        {error && <div className={style.error}>Tags limit reached - maximum {limit} tags allowed</div>}
      </div>
      <div className='row'>
        <label className={style.label} />
        <div className={style.tags}>
          {tags.map((t) => (
            <div key={t} className={style.tag}>
              <div>{t}</div>
              <button onClick={tagRemove.bind(this, t)}>{iconArray.close}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
