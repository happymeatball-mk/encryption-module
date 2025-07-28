import {Ui, Guardian, AccountManager, Logger} from './encmodule.js';

const customers = [
    {
        name: 'Simon Black',
        email: 'smblack@email.com',
        password: 'smlack_831'
    },
    {
        name: 'Oliver Eastwood',
        email: 'ostwd@email.com',
        password: 'ostwd_193'
    }
];

const ui = new Ui(customers);
const guardian = new Guardian();
const logger = new Logger();
const manager = new AccountManager();
ui.pipe(guardian).pipe(logger).pipe(manager);
