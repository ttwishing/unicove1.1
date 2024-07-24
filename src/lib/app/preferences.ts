import { dbPromise } from './db'

export class Preferences {

    static shared = new Preferences()

    private sleep(delay: number) {
        return new Promise((resolve) => setTimeout(resolve, delay))
    }


    public async initStorage() {
        console.log(`preferences.ts#initStorage---------->start`)
        const db = await dbPromise
        console.log(`preferences.ts#initStorage---------->finish`)
    }

}



