import React from "react"
import water from "../assets/water.gif"
import ground from "../assets/ground.png"
import shadow from "../assets/ground-shadow.png"

const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf("Apple") > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf("CriOS") === -1 &&
    navigator.userAgent.indexOf("FxiOS") === -1

export function RiverBank({ children }) {
    return (
        <g>
            {!isSafari && (
                <>
                    <image href={water} opacity={0.1} x={0} y={0} />
                    <image href={water} opacity={0.1} x={500} y={0} />
                    <image href={water} opacity={0.1} x={0} y={500} />
                    <image href={water} opacity={0.1} x={500} y={500} />
                </>
            )}
            {children}

            <g transform={"rotate(180 500 300) translate(-20 340)"}>
                <image href={shadow} opacity="0.4" width={1020} />
            </g>
            <g transform={"rotate(180 500 300) translate(0 360)"}>
                <image href={ground} width={1000} />
            </g>
        </g>
    )
}
