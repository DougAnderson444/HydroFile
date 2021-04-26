const IPFS = require('ipfs-core');
const jsonld = require('jsonld');

async function genCID() {
    const ipfs = await IPFS.create();
    const {cid} = await ipfs.add("Hello World!");
    console.log(cid);
}

genCID().then(cid => {console.log(cid)});
