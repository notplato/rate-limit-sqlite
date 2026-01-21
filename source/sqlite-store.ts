// /source/sqlite-store.ts
// A `sqlite` store for the `express-rate-limit` middleware.

import type {
    Store,
    Options as RateLimitOptions,
    ClientRateLimitInfo,
    IncrementResponse,
} from 'express-rate-limit'
import {DatabaseSync, StatementSync} from 'node:sqlite'
import type { Options } from './types.js'

/**
 * A `Store` for the `express-rate-limit` package that stores hit counts in
 * Sqlite.
 */
class SqliteStore implements Store{
    /**
	 * The duration of time before which all hit counts are reset (in milliseconds).
	 */
    private windowMs!: number

    /**
     * The string to prepend to the key
     */
    prefix!: string

    /**
     * The database object.
     */
    private db!: DatabaseSync
    
    /**
     * The prepared SQL functions
     */
    private prepared: Map<string, StatementSync> = new Map()

    /**
     * @constructor for `SqliteStore`.
     * 
     * @param options {Options} - The options used to configure the store's behaviour.
     */
    constructor(options?: Partial<Options>){
        this.prefix = options?.prefix ?? 'def'

        if(options?.location){
            try{
                this.db = new DatabaseSync(options.location)
            }
            catch(error){
                throw new Error('Cannot create database');
            }
        } else{
            this.db = new DatabaseSync(":memory:")
        }

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS hits(
            key TEXT PRIMARY KEY,
            totalHits INTEGER,
            resetTime INTEGER
            )
            `)
        
        
        this.prepared.set('inc', this.db.prepare("UPDATE hits\
            SET totalHits = totalHits + 1\
            WHERE key = ?"))

        this.prepared.set('dec', this.db.prepare("UPDATE hits\
            SET totalHits = totalHits - 1\
            WHERE key = ?"))

        this.prepared.set('resetKey', this.db.prepare("DELETE FROM hits\
            WHERE key = ?"))

        this.prepared.set('get', this.db.prepare("SELECT * FROM hits WHERE key = ? LIMIT 1"))

        this.prepared.set('resetAll', this.db.prepare("DELETE FROM hits"))

        this.prepared.set('insert', this.db.prepare("INSERT into hits VALUES (?,?,?)"))

        this.prepared.set('clearExpired', this.db.prepare("DELETE FROM hits\
            WHERE resetTime <= ?"))
    }

    /**
     * The init method.
     * 
     * @param options {RateLimitOptions} - The options used to setup express-rate-limit.
     */
    init(options: RateLimitOptions): void {
        this.windowMs = options.windowMs
    }

    /**
	 * Method to prefix the keys with the given text.
	 *
	 * Call this from get, increment, decrement, resetKey, etc.
	 *
	 * @param key {string} - The key.
	 *
	 * @returns {string} - The text + the key.
	 */
	prefixKey(key: string): string {
		return `${this.prefix}${key}`
	}

    /**
	 * Method to fetch a client's hit count and reset time.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
	 *
	 * @public
	 */
    get(key: string): ClientRateLimitInfo | undefined {
        const row = this.prepared.get('get')!.get(this.prefixKey(key))
        if (!row) return undefined

        return {
            totalHits: row.totalHits as number,
            resetTime: new Date(row.resetTime as number)
        }
    }

    /**
	 * Method to increment a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @returns {IncrementResponse} - The number of hits and reset time for that client.
	 *
	 * @public
	 */
    increment(key: string): IncrementResponse {
        this.prepared.get('clearExpired')!.run(Date.now())

        const prefixedKey = this.prefixKey(key)

        let row = this.get(key);
        if(row){
            this.prepared.get('inc')!.run(prefixedKey)
        }
        else
            this.prepared.get('insert')!.run(prefixedKey, 1, Date.now() + this.windowMs);

        return this.get(key) as IncrementResponse
    }

    /**
	 * Method to decrement a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @public
	 */
	decrement(key: string): void {
		this.prepared.get('dec')!.run(this.prefixKey(key))
	}

    /**
	 * Method to reset a client's hit counter.
	 *
	 * @param key {string} - The identifier for a client.
	 *
	 * @public
	 */
	resetKey(key: string): void {
		this.prepared.get('resetKey')!.run(this.prefixKey(key))
	}

    /**
	 * Method to reset everyone's hit counter.
	 *
	 * @public
	 */
	resetAll(): void {
		this.prepared.get('resetAll')!.run()
	}

    /**
	 * Method to shutdown the store and release all resources.
	 */
    shutdown(): void {
        this.prepared.get('clearExpired')!.run(Date.now())

        this.db.close()
    }
}

// Export it to the world!
export default SqliteStore