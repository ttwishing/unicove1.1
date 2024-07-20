import { derived, writable } from 'svelte/store'
import { LinkSession } from '$lib/anchor-link/link-session'
import type { SessionLike } from './auth'

export const appReady = writable<boolean>(false)

export const activeSession = writable<LinkSession | undefined>(undefined)
export const availableSessions = writable<SessionLike[]>([])



