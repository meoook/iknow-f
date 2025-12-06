// import React from 'react'

type IconName =
  | 'add_o'
  | 'arrow_back'
  | 'arrow_down'
  | 'arrow_up'
  | 'arrow_right'
  | 'home'
  | 'search'
  | 'user'
  | 'settings'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  // svgProps?: React.SVGAttributes<SVGElement>
}

export default function IconSprite({ name, size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    // <svg width={size} height={size} fill={color} className={className} {...svgProps}>
    <svg width={size} height={size} fill={color} className={className}>
      <use href={`/sprite.svg#${name}`} />
    </svg>
  )
}
