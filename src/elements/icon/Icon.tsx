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
  | 'draft'
  | 'error'
  | 'exit'
  | 'favorite'
  | 'finish'
  | 'info'
  | 'menu'
  | 'metamask'
  | 'moon'
  | 'more'
  | 'phantom'
  | 'search'
  | 'star'
  | 'success'
  | 'trend'
  | 'tultip'
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
