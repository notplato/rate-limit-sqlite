// /source/types.ts
// The type definitions for this package.

export type Options = {
    /**
     * The text to prepend to the key.
     */
    prefix: string

    /**
     * The location to store the sqlite database,
     * stored in memory by default.
     */
    location: string
}