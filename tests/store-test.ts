// /test/store-test.ts
// Tests for all the methods of the store

import { describe, it }  from 'node:test'
import assert from 'node:assert/strict'
import { SqliteStore } from '../source/index.js'

/**
 * Makes the program sleep.
 * 
 * @param ms {ms} - the time in ms to sleep for.
 */
function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('test the methods for a in-memory Sqlite database', () => {
    it('increments for a new key', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        const response = store.increment('1.2.3.4')
        assert(response.totalHits === 1, `expected 1 totalHits, got ${response.totalHits}`)
        assert(response.resetTime instanceof Date, `expected a Date, got ${typeof response.resetTime}`)

        store.shutdown()
    })

    it('increments for a existing key', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        store.increment('1.2.3.4')
        store.increment('1.2.3.4')
        const response = store.increment('1.2.3.4')

        assert(response.totalHits === 3, `expected 1 totalHits, got ${response.totalHits}`)
        assert(response.resetTime instanceof Date, `expected a Date, got ${typeof response.resetTime}`)

        store.shutdown()
    })

    it('decrements for a existing key', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        store.increment('1.2.3.4')
        store.increment('1.2.3.4')
        store.decrement('1.2.3.4')
        const response = store.get('1.2.3.4')

        assert(response!.totalHits === 1, `expected 1 totalHits, got ${response!.totalHits}`)
        assert(response!.resetTime instanceof Date, `expected a Date, got ${typeof response!.resetTime}`)

        store.shutdown()
    })

    it('resets the key for a existing key', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        store.increment('1.2.3.4')
        store.resetKey('1.2.3.4')
        const response = store.get('1.2.3.4')

        assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

        store.shutdown()
    })

    it('resets all the keys', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        store.increment('1.2.3.4')
        store.increment('1.2.3.5')
        store.increment('1.2.3.6')
        store.resetAll()

        let response = store.get('1.2.3.4')
        assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

        response = store.get('1.2.3.5')
        assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

        response = store.get('1.2.3.6')
        assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

        store.shutdown()
    })

    it('gets the totalHits when the key exists', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })
        
        store.increment('1.2.3.4')
        const response = store.get('1.2.3.4')

        assert(response!.totalHits === 1, `expected 1 totalHits, got ${response?.totalHits}`)

        store.shutdown()
    })

    it('gets undefined when the key does not exists', () => {
        const store = new SqliteStore()
        // @ts-expect-error
        store.init({ windowMs: 2 * 1000 })

        const response = store.get('1.2.3.4')

        assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

        store.shutdown()
    })
});

it('key is reset after windowMs', async () => {
    const store = new SqliteStore()
    // @ts-expect-error
    store.init({ windowMs: 2 * 1000 })
    
    store.increment('1.2.3.4')
    await sleep(2 * 1000)
    store.increment('1.2.3.5')

    const response = store.get('1.2.3.4')

    assert(response === undefined, `expected response to be undefined, got ${typeof response}`)

    store.shutdown()
})