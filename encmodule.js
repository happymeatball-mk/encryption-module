import { Readable, Transform, Writable } from 'node:stream';
import { EventEmitter } from 'node:events';

const toHex = string => Buffer.from(string, 'utf8').toString('hex')

export class Ui extends Readable {
    constructor(data, opts = {}) {
        super({ objectMode: true, ...opts });
        this.queue = Array.isArray(data) ? [...data] : [data];
    }

    _read() {
        if (this.queue.length === 0) {
            this.push(null);
        } else {
            this.push(this.queue.shift());
        }
    }
}

export class Guardian extends Transform {
    constructor(opts = {}) {
        super({ objectMode: true, ...opts })
    }

    _transform(chunk, encoding, callback) {
        try {
            const { email, password, ...rest } = chunk;

            const secured = {
                meta: { source: 'ui' },
                payload: {
                    ...rest,
                    email:    email    ? toHex(email) : undefined,
                    password: password ? toHex(password) : undefined,
                },
            };

            this.push(secured);
            callback();
        } catch (err) {
            callback(err);
        }
    }
}

export class Decryptor extends Transform {
    constructor(opts = {}) {
        super({ objectMode: true, ...opts });
    }

    _transform(chunk, encoding, callback) {
        try {
            const decrypted = {
                ...chunk.payload,
                email: chunk.payload.email ? Buffer.from(chunk.payload.email, 'hex').toString('utf8') : undefined,
                password: chunk.payload.password ? Buffer.from(chunk.payload.password, 'hex').toString('utf8') : undefined,
            };
            this.push(decrypted);
            callback();
        } catch (err) {
            callback(err);
        }
    }
}

export class AccountManager extends Writable {
    constructor(opts = {}) {
        super({ objectMode: true, ...opts });
        this.accounts = [];
    }

    _write(chunk, encoding, callback) {
        try {
            this.accounts.push(chunk);
            console.log(chunk.payload);
            callback();
        } catch (err) {
            callback(err);
        }
    }
}

class DB extends EventEmitter {
    constructor() {
        super();
        this.data = [];

        this.on('log', this.#add.bind(this));
    }

    #add(data) {
        this.data.push({
            source: 'db',
            payload: data,
            created: new Date().toString(),
        });
    }
    
}

export class Logger extends Transform {
    constructor(opts = {}) {
        super({ objectMode: true, ...opts });
        this.db = new DB();
    }

    _transform(chunk, encoding, callback) {
        this.db.emit('log', chunk);
        this.push(chunk);
        callback();
    }
}