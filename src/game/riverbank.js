import React from "react"
import water from "../assets/waternice.gif"

export function RiverBank({ children }) {
    return (
        <g>
            <filter id="duotone">
                <feColorMatrix
                    type="matrix"
                    values=".02 .02 .22 0 0
      .02 .02 .11 0 0
      .11 .11 .11 0 0
      0   0   0  1 0"
                />
            </filter>
            {children}

            <g
                transform={"rotate(180 500 300) translate(-20 320)"}

            >
                <image
                    href="https://www.downloadclipart.net/large/ground-png-photos.png"
                    filter="url(#duotone)"
                    opacity="0.3"
                    width={1020}
                />
            </g>
            <g
                transform={"rotate(180 500 300) translate(0 360)"}
            >
                <image
                    href="https://www.downloadclipart.net/large/ground-png-photos.png"
                    width={1000}
                />
            </g>
        </g>
    )
}
