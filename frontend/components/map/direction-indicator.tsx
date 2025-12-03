import React from 'react'
import { cn } from '@/lib/utils'

interface DirectionalIndicatorProps {
  name: string
  distance: number
  bearing: number
  className?: string
}

export const DirectionalIndicator = ({ name, distance, bearing, className }: DirectionalIndicatorProps) => {
  // Format distance with 1 decimal place for < 10km, no decimals for >= 10km
  const formattedDistance = distance < 10
    ? distance.toFixed(1)
    : Math.round(distance).toString()

  const normalizedBearing = ((bearing % 360) + 360) % 360;

  let containerClasses = "flex-col";
  let textClasses = "items-center text-center";

  if (normalizedBearing >= 315 || normalizedBearing < 45) {
    // Up
    containerClasses = "flex-col";
    textClasses = "items-center text-center";
  } else if (normalizedBearing >= 45 && normalizedBearing < 135) {
    // Right
    containerClasses = "flex-row-reverse";
    textClasses = "items-end text-right";
  } else if (normalizedBearing >= 135 && normalizedBearing < 225) {
    // Down
    containerClasses = "flex-col-reverse";
    textClasses = "items-center text-center";
  } else {
    // Left
    containerClasses = "flex-row";
    textClasses = "items-start text-left";
  }

  return (
    <div className={cn("hidden  items-center justify-center gap-2", containerClasses, className)}>
      {/* Arrow pointing to the nearest animita */}
      <div
        className="relative size-16 flex items-center justify-center"
        style={{ transform: `rotate(${bearing}deg)` }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          {/* Arrow shape */}
          <path
            d="M32 8 L40 28 L36 28 L36 56 L28 56 L28 28 L24 28 Z"
            fill="#111111"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Name and distance */}
      <div className={cn("flex flex-col gap-0.5", textClasses)}>
        <h3 className="text-sm font-semibold text-card-foreground leading-tight [text-shadow:1.5px_1.5px_0_#fff,_-1.5px_1.5px_0_#fff,_1.5px_-1.5px_0_#fff,_-1.5px_-1.5px_0_#fff] max-w-[120px] truncate">
          {name}
        </h3>
        <p className="text-sm font-medium text-card-foreground/80 [text-shadow:1px_1px_0_#fff,_-1px_1px_0_#fff,_1px_-1px_0_#fff,_-1px_-1px_0_#fff]">
          A {formattedDistance} km
        </p>
      </div>
    </div>
  )
}
