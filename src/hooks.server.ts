import type { Handle } from '@sveltejs/kit'
import { init, init as initAuth } from './auth'

let inited = false

export const handle = (async ({ event, resolve }) => {
    console.log("handle=================")
    if (!inited) {
        inited = true
        await init()
    }
    const path = event.url.pathname
    console.log(`path = ${path}`)
    return await resolve(event)
}) satisfies Handle