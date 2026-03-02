// import React from 'react'

export type IconName =
  | 'activity'
  | 'arrow_down'
  | 'bell'
  | 'bell-z'
  | 'check'
  | 'close'
  | 'copy'
  | 'crown'
  | 'delete'
  | 'diff'
  | 'discord'
  | 'draft'
  | 'error'
  | 'exit'
  | 'favorite'
  | 'finish'
  | 'flag'
  | 'info'
  | 'instagram'
  | 'mail'
  | 'menu'
  | 'metamask'
  | 'moon'
  | 'more'
  | 'pencil'
  | 'phantom'
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
  // className?: string
  // svgProps?: React.SVGAttributes<SVGElement>
}

export default function IconSprite({ name, size = 24, color = 'currentColor' }: IconProps) {
  return (
    // <svg width={size} height={size} fill={color} className={className} {...svgProps}>
    <svg width={size} height={size} fill={color}>
      <use href={`/sprite.svg#${name}`} />
    </svg>
  )
}
