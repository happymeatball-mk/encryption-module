import { Readable, Transform, Writable } from 'node:stream';

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
