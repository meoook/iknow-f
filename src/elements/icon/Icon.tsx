// import React from 'react'

type IconName =
  | 'activity'
  | 'crown'
  | 'diff'
  | 'exit'
  | 'finish'
  | 'menu'
  | 'moon'
  | 'search'
  | 'star'
  | 'trend'
  | 'tultip'
  | 'volume'

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
