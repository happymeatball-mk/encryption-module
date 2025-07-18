const { Readable } = require('node:stream');

class Ui extends Readable {

    constructor() {
        super();
        this.customers = new Map()
    }

    _read() {
        
    }

};

