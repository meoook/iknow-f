import { useMemo } from 'react'
import { QrCode, Ecc } from './qr_new'

interface QRCodeSvgProps {
  text: string
  size?: number
  logoUrl?: string
  backgroundColor?: string
  color?: string
}

export default function QRCodeSvg({
  text,
  size = 200,
  logoUrl,
  backgroundColor = '#181A20', // Default dark background
  color = '#FFFFFF', // Default dots color
}: QRCodeSvgProps) {
  const qr = useMemo(() => {
    // Error correction level H (30%) allows covering the center with a logo
    return QrCode.encodeText(text, Ecc.HIGH)
  }, [text])

  const moduleCount = qr.size
  const cellSize = size / moduleCount
  const logoSize = size * 0.25 // Logo takes up 25% of the QR code
  const logoPosition = (size - logoSize) / 2

  // Find modules that should be covered by the logo
  const isLogoArea = (row: number, col: number) => {
    if (!logoUrl) return false

    // Calculate logo bounds in terms of modules
    const logoMinModule = Math.floor(logoPosition / cellSize)
    const logoMaxModule = Math.ceil((logoPosition + logoSize) / cellSize)

    // Add 1 module padding around the logo
    return row >= logoMinModule - 1 && row <= logoMaxModule && col >= logoMinModule - 1 && col <= logoMaxModule
  }

  // Find modules that are part of the 3 positioning eyes (top-left, top-right, bottom-left)
  const isEyeArea = (row: number, col: number) => {
    // Each eye is 7x7 modules
    const isTopLeft = row < 7 && col < 7
    const isTopRight = row < 7 && col >= moduleCount - 7
    const isBottomLeft = row >= moduleCount - 7 && col < 7

    return isTopLeft || isTopRight || isBottomLeft
  }

  // Custom eye shapes using square borders
  const renderEyePathRects = () => {
    const positions = [
      { x: 0, y: 0 },
      { x: (moduleCount - 7) * cellSize, y: 0 },
      { x: 0, y: (moduleCount - 7) * cellSize },
    ]
    const innerSize = 3 * cellSize
    const strokeWidth = 1 * cellSize // 1 module wide stroke

    return positions.map((pos, idx) => {
      return (
        <g key={`eye-custom-${idx}`}>
          {/* Outer square (transparent with stroke) */}
          <rect
            x={pos.x + strokeWidth / 2}
            y={pos.y + strokeWidth / 2}
            width={7 * cellSize - strokeWidth}
            height={7 * cellSize - strokeWidth}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Inner solid square */}
          <rect x={pos.x + 2 * cellSize} y={pos.y + 2 * cellSize} width={innerSize} height={innerSize} fill={color} />
        </g>
      )
    })
  }

  const dots = []

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = qr.getModule(col, row)

      if (!isDark) continue // Skip white cells
      if (isLogoArea(row, col)) continue // Skip cells beneath the logo
      if (isEyeArea(row, col)) continue // Skip eyes (drawn separately)

      // Draw standard data modules as circles
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * cellSize + cellSize / 2}
          cy={row * cellSize + cellSize / 2}
          r={cellSize * 0.45} // Almost full size but rounded
          fill={color}
        />,
      )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ background: backgroundColor, borderRadius: '24px', padding: '16px', boxSizing: 'content-box' }}>
      {/* 1. The data dots */}
      {dots}

      {/* 2. The 3 large corner markers (eyes) */}
      {renderEyePathRects()}

      {/* 3. The center logo (if present) */}
      {logoUrl && (
        <g>
          {/* Subtle dark background circle behind the logo so dots don't bleed */}
          <circle cx={size / 2} cy={size / 2} r={logoSize / 2 + cellSize} fill={backgroundColor} />
          {/* The logo image itself */}
          <image
            href={logoUrl}
            x={logoPosition}
            y={logoPosition}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio='xMidYMid slice'
            // Simple circular clip path for the logo
            clipPath={`url(#logo-clip)`}
          />
          <defs>
            <clipPath id='logo-clip'>
              <circle cx={size / 2} cy={size / 2} r={logoSize / 2} />
            </clipPath>
          </defs>
        </g>
      )}
    </svg>
  )
}
