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
  })
  it('expect to be able to make a hydroFile object with a on zero id', async () => {
    hydroFile = new HydroFile(ipfs, { persist: false })
    await hydroFile.ready()

    expect(hydroFile.hypercore.key.toString('hex')).to.have.lengthOf(64)
  })

  it('should track a CID', async () => {
    await ipfs
    const name = 'hello.txt' // name what you are saving
    const helloCID = await ipfs.add('Hello world')
    const CID = await hydroFile.track(helloCID, { name })

    expect(helloCID.toString()).to.equal(CID)
  })
})
