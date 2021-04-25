const IPFS = require('ipfs-core')
const jsonld = require('jsonld');

const ipfs = await IPFS.create()
const { cid } = await ipfs.add('Hello world')
console.info(cid)