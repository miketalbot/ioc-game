import React from "react"
import water from "../assets/waternice.gif"

export function RiverBank({ children }) {
    return (
        <g style={{ zIndex: 1 }}>
            <filter id="duotone">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.3" />
                <feColorMatrix
                    type="matrix"
                    values=".02 .02 .22 0 0
      .02 .02 .11 0 0
      .11 .11 .11 0 0
      0   0   0  1 0"
                />
            </filter>
            <image href={water} opacity="0.13" x={0} y={0} width={400} />
            <image href={water} opacity="0.13" x={400} y={0} width={400} />
            <image href={water} opacity="0.13" x={800} y={0} width={400} />
            <image href={water} opacity="0.13" x={0} y={400} width={400} />
            <image href={water} opacity="0.13" x={400} y={400} width={400} />
            <image href={water} opacity="0.13" x={800} y={400} width={400} />

            {children}
            <image
                href="https://www.downloadclipart.net/large/ground-png-photos.png"
                transform="rotate(180)"
                transform-origin="50% 50%"
                filter="url(#duotone)"
                opacity="0.3"
                x={-20}
                y={450}
                width={1020}
            />
            <image
                href="https://www.downloadclipart.net/large/ground-png-photos.png"
                transform="rotate(180)"
                transform-origin="50% 50%"
                x={0}
                y={480}
                width={1000}
            />
        </g>
    )
}
