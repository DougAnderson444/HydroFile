// test.mjs
import { HydroFile } from '../src/index.js'
import * as IPFS from 'ipfs-core'
import chai from 'chai'
const expect = chai.expect

let hydroFile
let ipfs

describe('Test', function () {
  // 'not the proper"

  before(async function () {
    // runs once before the first test in this block
    ipfs = await IPFS.create()
    const id = await ipfs.id()
    console.log("Ipfs init'd", { id: id.id })
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
    const result = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    hydroFile.setRootCID(type, name, result.cid)
    expect(hydroFile.hypercore.length).to.equal(0)

    const newResult = await ipfs.add("Hello New World Order")
    const { updatedThreadRootCID, updatedRootCID } = await hydroFile.track(newResult.cid, { name, type, keywords })
    expect(hydroFile.hypercore.length).to.equal(1)
    
    // check the hypercore for a match
    // API: https://github.com/hypercore-protocol/hypercore
    const rootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)
    console.log({rootCID})


    // TODO: For some reason, not drillign down into the object>??
    try {
      console.log("HI")
      const hello = await ipfs.dag.get(rootCID.cid) // , { path: 'IPFSObject/hello.txt' }
      console.log("HI")
      console.log({ hello })

      const helloDeep = await ipfs.dag.get(rootCID, { path: 'IPFSObject/hello.txt' })
      console.log({ helloDeep }) // TypeError: string.startsWith is not a function
    } catch (error) {
      console.error(error)
    }

    // expect(updatedThreadRootCID).to.equal('bafyreibblxeqpfhgjczn54rjvvh26ofhecudanluebrn2ntnodwilbv7uy')
    // expect(updatedRootCID).to.equal('bafyreiajjh7zooh2hiqebnf6sspfm3wmgrxdhcuio4jhujsbnfopzoswwu')

    // expect(helloCID.toString()).to.equal(CID)
  })
})
