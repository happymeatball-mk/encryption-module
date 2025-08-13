
## Description

A simple application for encryption/decryption, implemented using streams.

## Quickstart

Install node.js - https://nodejs.org/en

Clone the repository and run the script using Node.js.

git clone https://github.com/happymeatball-mk/encryption-module.git
cd \the-path-to-your-repository\encryption-module
node index.js

## Expected output

```js
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
const guardian = new Guardian();        // data encryption 
const logger1 = new Logger();
const manager = new AccountManager();   
const decrypt = new Decryptor();        // data decryption

ui.pipe(guardian).pipe(logger1).pipe(manager);

Result:
{
  meta: { source: 'ui' },
  payload: {
    name: 'Simon Black',
    email: '8435d765b01e623a5a7b683c32c4835201a6750b0105eb579c5e589175acce69',
    password: 'aab7ec92ee246f1c63cbaa45880eb40a'
  }
}
{
  meta: { source: 'ui' },
  payload: {
    name: 'Oliver Eastwood',
    email: 'da87bfed573553f52b10132b227d1bfe',
    password: '669c40659abf4ed8fb8ad8b24fe34bbd'
  }
}
