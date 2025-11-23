import crypto from 'crypto'
const hash = crypto.createHash('sha256').update('password').digest('hex')
console.log('SHA256 hash of "password":', hash)
