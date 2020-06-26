import { ensureArray, handle, once } from "./event-bus"

handle("initializeGame", async function loadJS(parameters) {
    const promises = []
    const toLoad = ensureArray(parameters.load)
    let id = 0
    for (let load of toLoad) {
        const thisId = id++
        let response = await fetch(load)
        if (response.ok) {
            let script = await response.text()

            //Add a promise for the script loading
            promises.push(
                new Promise((resolve) => {
                    once(`loaded${thisId}`, () => {
                        console.log("loaded", load)
                        resolve()
                    })
                })
            )

            script = `${script};Framework.EventBus.raise("loaded${thisId}");`
            const element = document.createElement("script")
            element.innerHTML = script
            document.body.appendChild(element)
        }
    }
    await Promise.all(promises)
})
