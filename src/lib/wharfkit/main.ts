import { init as initAuth } from './auth'
import { writable } from 'svelte/store'

export const appReady = writable<boolean>(false)

async function init() {
    try {
        await Promise.all([initAuth()])
    } catch (error) {
        console.warn('Error when initializing Anchor Link', error)
    } finally {
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