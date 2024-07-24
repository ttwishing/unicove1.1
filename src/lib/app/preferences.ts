import { dbPromise } from './db'

export class Preferences {

    static shared = new Preferences()

    private sleep(delay: number) {
        return new Promise((resolve) => setTimeout(resolve, delay))
    }


    public async initStorage() {
        const db = await dbPromise
    }

}



