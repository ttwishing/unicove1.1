export interface Form {
    setInput: (name: string, valid: boolean) => void
    onChange: (response: InputResponse) => void
}

export interface FormTransaction {
    awaitAccountUpdate: (account: any) => void
    clear: () => void
    retryTransaction: () => void
    setTransaction: (id: string) => void
    setTransactionError: (error: any) => void
}

export interface InputResponse {
    name: string
    valid: boolean
    value: string
}

export interface NavigationItem {
    exactPath?: boolean
    icon: string
    name: string
    path: string
}

export type inputType =
    | 'text'
    | 'search'
    | 'none'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | null
    | undefined
