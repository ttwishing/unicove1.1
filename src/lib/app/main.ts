import { init as initAuth } from './auth'
import { Preferences } from './preferences'
import { appReady } from './store'

async function init() {
    try {
        await Promise.all([initAuth(), Preferences.shared.initStorage()])
    } catch (error) {
        console.log("main.ts===error: ", error)
        console.warn('Error when initializing Anchor Link', error)
    } finally {
        console.log("main.ts===finally")
    }
}

let initialed = false;

export function initApp() {
    if (initialed)
        return;
    console.log("initApp, start")
    initialed = true
    init()
        .then(() => {
            console.log("initApp, finish")
            appReady.set(true)
        })
        .catch((error) => {
            console.error('Fatal error, unable to initialize app', error)
            // TODO: error display UI
        })

}