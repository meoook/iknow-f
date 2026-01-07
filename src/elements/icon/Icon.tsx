// import React from 'react'

type IconName =
  | 'activity'
  | 'arrow_down'
  | 'bell'
  | 'bell-z'
  | 'check'
  | 'close'
  | 'crown'
  | 'delete'
  | 'diff'
  | 'draft'
  | 'error'
  | 'exit'
  | 'finish'
  | 'info'
  | 'menu'
  | 'metamask'
  | 'moon'
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
