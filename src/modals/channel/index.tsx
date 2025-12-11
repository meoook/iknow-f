import style from './channel.module.scss'
import { useContext, useEffect, useState } from 'react'
import { ChannelContext } from '../../context/channel/channelContext'
import { AppContext } from '../../context/application/appContext'
import DropzoneAuto from '../../elements/dropzone'
import InputTextArea from '../../elements/input-textarea'
import iconArray from '../../elements/ico-get/icons'

export default function ModalChannel() {
  const { channel } = useContext(ChannelContext)

  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Edit your channel</h1>
      <div className={style.section}>
        <Banner src={channel?.image} />
      </div>
      <ChannelDescription description={channel?.description || ''} />
      <TagsList tags={channel?.tags || []} />
    </div>
  )
}

const Banner = ({ src }: { src?: string }) => {
  return (
    <div className='row'>
      <label className={style.label}>Banner</label>
      <DropzoneAuto imageType='channel' resolution='1260x260' imageSrc={src} />
    </div>
  )
}

const ChannelDescription = ({ description }: { description: string }) => {
  const limit = 2000 // TODO: to env
  const regex = new RegExp(`^.{0,${limit}}$`)
  const { channelUpdate } = useContext(AppContext)
  const [value, setValue] = useState<string>(description)
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    setAmount(limit - event.target.value.length)
    if (regex.test(event.target.value)) setError(false)
  }

  useEffect(() => {
    setAmount(limit - value.length)
    let timer: any = null
    if (!regex.test(value)) setError(true)
    else if (value.length > 5 && value !== description) {
      timer = setTimeout(() => {
        channelUpdate({ description: value }).then((result) => {
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

  const color = error ? 'red' : success ? 'green' : 'gray'
  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>Description</label>
        <InputTextArea value={value} color={color} ph={`Maximmum ${limit} symbols`} rows={3} onChange={change} />
      </div>
      <div className='row'>
        <div className={style.label} />
        <div className={style.row}>
          {!error && <div className={style.help}>Description about your channel</div>}
          {error && <div className={style.error}>{limit} symbols limit reached</div>}
          <div className={style.help}>
            {amount} of {limit} left
          </div>
        </div>
      </div>
    </div>
  )
}

const TagsList = ({ tags }: { tags: string[] }) => {
  const limit = 4 // TODO: to env
  const { channelTagAdd, channelTagRemove } = useContext(AppContext)
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
    else channelTagAdd(value)
    setValue('')
  }

  const color = error ? 'border error' : 'border'
  return (
    <div className={style.section}>
      <div className='row'>
        <label className={style.label}>Channel tags</label>
        <div className={style.row}>
          <input className={color} value={value} onKeyDown={keyCheck} onChange={handle} />
          <button className='btn green' onClick={add}>
            Add
          </button>
        </div>
      </div>
      <div className='row'>
        <label className={style.label} />
        {!error && <div className={style.help}>Default tags when creating new session ({limit} max)</div>}
        {error && <div className={style.error}>Tags limit reached - maximum {limit} tags allowed</div>}
      </div>
      <div className='row'>
        <label className={style.label} />
        <div className={style.tags}>
          {tags.map((t) => (
            <div key={t} className={style.tag}>
              <div>{t}</div>
              <button onClick={channelTagRemove.bind(this, t)}>{iconArray.close}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
