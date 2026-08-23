import IconSprite from '../icon'

export default function Socials() {
  return (
    <div className='secondary row center gap-4'>
      <a href='mailto:hello@ivanga.me' target='_blank' className='up' rel='noreferrer'>
        <IconSprite name='mail' size={20} />
      </a>
      <a href='https://twitter.com/ivanga' target='_blank' className='up' rel='noreferrer'>
        <IconSprite name='twitter' size={20} />
      </a>
      <a href='https://instagram.com/ivanga' target='_blank' className='up' rel='noreferrer'>
        <IconSprite name='instagram' size={20} />
      </a>
      <a href='https://discord.gg/ivanga' target='_blank' className='up' rel='noreferrer'>
        <IconSprite name='discord' size={20} />
      </a>
      <a href='https://tiktok.com/@ivanga' target='_blank' className='up' rel='noreferrer'>
        <IconSprite name='tiktok' size={20} />
      </a>
    </div>
  )
}
