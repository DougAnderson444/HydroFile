const IPFS = require('ipfs-core')
const jsonld = require('jsonld')

async function genCID ({ metaData, data }) {
  const ipfs = await IPFS.create()
  const { cid } = await ipfs.add('Hello World!')
  console.log(cid.toString())

  // now create a linked data object
  const linkedDataObject =
  {
    '@context': 'http://schema.org/',
    '@type': 'CIDWrapper',
    cid: {
      '@id': { '/': cid.toString() }
    },
    name: metaData.name
  }

  // save this linked data object to ipld:
  const linkedDataCID = await ipfs.dag.put(linkedDataObject)

  // get the object back and have a look
  const result = await ipfs.dag.get(linkedDataCID)

  console.log(JSON.stringify(result, null, 2))

  return linkedDataCID
}

const params = {
  metaData: {
    name: 'hello.txt'
  },
  data: 'hello World'
}
genCID(params).then(cid => {
  console.log({ cid })

  process.exit(0) // exit the node loop
})
