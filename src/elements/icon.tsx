// import React from 'react'

export type IconName =
  | 'activity'
  | 'add'
  | 'arrow_down'
  | 'arrow_back'
  | 'bank'
  | 'bell'
  | 'bell-z'
  | 'check'
  | 'close'
  | 'copy'
  | 'crown'
  | 'delete'
  | 'diff'  // TODO: Not used
  | 'discord'
  | 'draft'
  | 'error'
  | 'exit'
  | 'favorite'
  | 'filter'
  | 'finish'
  | 'fire'
  | 'flag'
  | 'home'
  | 'info'
  | 'instagram'
  | 'mail'
  | 'menu'
  | 'metamask'
  | 'moon'
  | 'more'
  | 'pencil'
  | 'phantom'
  | 'plus'
  | 'report'
  | 'search'
  | 'star'
  | 'success'
  | 'tiktok'
  | 'trend'
  | 'tultip'
  | 'twitter'
  | 'upload'
  | 'vk'
  | 'volume'
  | 'warning'

interface IconProps {
  name: IconName
  size?: number
  color?: string
}

export default function IconSprite({ name, size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} fill={color}>
      <use href={`/sprite.svg#${name}`} />
    </svg>
  )
}
