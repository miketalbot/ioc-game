import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import primary from "@material-ui/core/colors/deepOrange"
import { ThemeProvider } from "@material-ui/styles"
import { createMuiTheme } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import './lib/sound'
import './lib/event-bus'

const theme = createMuiTheme({
    palette: {
        primary
    }
})

const Framework = window.Framework = window.Framework || {}
Framework.theme = theme

const rootElement = document.getElementById("root")
ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    rootElement
)
