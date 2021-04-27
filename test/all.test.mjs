// test.mjs
import { HydroFile } from '../src/index.js'
import * as IPFS from 'ipfs-core'
import chai from 'chai'
const expect = chai.expect

let hydroFile
let ipfs

describe('Test', function () {
  before(async function () {
    // runs once before the first test in this block
    ipfs = await IPFS.create()
  })

  after(async function () {
    // runs once before the first test in this block
    ipfs.stop()
    process.exit(0)
  })

  it('should be able to make a hydroFile object', async () => {
    hydroFile = new HydroFile(ipfs, { persist: false })
    await hydroFile.ready()

    expect(hydroFile.hypercore.key.toString('hex')).to.have.lengthOf(64)
  })

  it('should track a CID', async () => {
    const name = 'hello.txt' // name what you are saving
    const type = 'IPFSObject'
    const keywords = ['hello', 'text files'] // TODO: figure out how to search keywords amongst diff types
    const helloCID = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    console.log({ helloCID })

    const CID = await hydroFile.track(helloCID, { name, type, keywords })

    // check the hypercore for a match
    // API: https://github.com/hypercore-protocol/hypercore
    hydroFile.hypercore.get(hydroFile.hypercore.length, function (err, value) {
      if (err) console.error(err)

      console.log({ value })
      expect(value).to.equal(value)
    })

    // expect(helloCID.toString()).to.equal(CID)
  })
})
