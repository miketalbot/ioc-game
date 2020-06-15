import React from "react"
import { Box } from "@material-ui/core"

export function CenteredBox({ children, style, ...props }) {
    return (
        <Box
            position="absolute"
            left="50%"
            top="50%"
            textAlign="left"
            style={{ transform: "translate3d(-50%, -50%, 0)", ...style }}
            {...props}
        >
            {children}
        </Box>
    )
}
