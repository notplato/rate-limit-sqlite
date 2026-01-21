# <div align="center"> `rate-limit-sqlite` </div>

<div align="center">
	<img alt="npm version" src="https://img.shields.io/npm/v/rate-limit-sqlite.svg"/>
	<img alt="GitHub Stars" src="https://img.shields.io/github/stars/notplato/rate-limit-sqlite"/>
	<img alt="npm downloads" src="https://img.shields.io/npm/dm/rate-limit-sqlite"/>
</div>

<br>

<div align="center">

A [SQLite](https://sqlite.org/index.html) store for the
[`express-rate-limit`](https://github.com/nfriedly/express-rate-limit)
middleware.

</div>

## Installation

From the npm registry:

```sh
# Using npm
> npm install rate-limit-sqlite
# Using yarn or pnpm
> yarn/pnpm add rate-limit-sqlite
```

## Usage

### Importing

This package is pure ESM. Please read [this article](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) for a guide on how to ensure your project can import this library.

**This package requires you to use Node 22 or above.**

Import it in a ESM project (`type: module` in `package.json`) as follows:

```ts
import { SqliteStore } from 'rate-limit-sqlite'
```

### Examples

```ts
import { rateLimit } from 'express-rate-limit'
import { SqliteStore } from 'rate-limit-sqlite'

// Create and use the rate limiter
const limiter = rateLimit({
	// Rate limiter configuration
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers

	// SQLite store configuration
	store: new SqliteStore({
        location: "..." // Path to database file on disk
        prefix: "..." // Prefix for each key to store in database
    }),
})
app.use(limiter)
```

### Configuration

#### `location`

> `string` | `undefined`

The path to the database file on disk. Use `:memory:` or omit the option to use an in-memory SQLite database instead.

Defaults to `:memory:`.

#### `prefix`

> `string` | `undefined`

The text to prepend to the key in the database.

Defaults to `def`.

## License

MIT © [Srinivas Kolla](https://github.com/notplato)
