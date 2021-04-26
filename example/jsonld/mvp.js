const IPFS = require('ipfs-core')
const jsonld = require('jsonld')

async function genCID () {
  const ipfs = await IPFS.create()
  const { cid } = await ipfs.add('Hello World!')
  console.log(cid.toString())
  return cid
}

genCID().then(cid => {
  console.log({ cid })

  process.exit(0) // exit the node loop
})
