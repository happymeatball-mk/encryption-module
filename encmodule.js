import { Readable, Transform, Writable } from 'node:stream';
import { EventEmitter } from 'node:events';
import { createCipheriv, createDecipheriv } from 'node:crypto';

const key = Buffer.from('12345678901234567890123456789012'); 
const iv = Buffer.from('1234567890123456');

function encrypt(data) {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(data) {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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
                    email:    email    ? encrypt(email) : undefined,
                    password: password ? encrypt(password) : undefined,
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
                email: chunk.payload.email ? decrypt(chunk.payload.email) : undefined,
                password: chunk.payload.password ? decrypt(chunk.payload.password) : undefined,
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
            console.log(chunk);
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

