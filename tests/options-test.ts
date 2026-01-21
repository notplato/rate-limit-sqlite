// /tests/options-test.ts
// Tests for the configurable options of the store

import test, { it } from "node:test";
import assert from 'node:assert/strict'
import fs from 'fs'
import { SqliteStore } from '../source/index.js'

it('keys are stored with prefix', async () => {
    const prefix = 'test'
    const store = new SqliteStore({ prefix: prefix })
    // @ts-expect-error
    store.init({ windowMs: 2 * 1000 })

    assert(store.prefix === prefix, `expected prefix to be 'test', got ${store.prefix}`)

    store.shutdown()
})

it('database created at specified location', async () => {
    const storePath = './options_test-db'
    const store = new SqliteStore({ location: storePath })
    // @ts-expect-error
    store.init({ windowMs: 2 * 1000 })

    assert(fs.existsSync(storePath), `expected store to be created at ${storePath}`)
    store.shutdown()
    fs.unlink(storePath, (err) => {
        if(err) throw err
    })
}
)