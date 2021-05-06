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
    this.timeout(3000)
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
    const helloResults = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    // const { path, cid, mode, mtime } = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    console.log(helloResults.cid)


    const { updatedThreadRootCID, updatedRootCID } = await hydroFile.track(helloResults.cid, { name, type, keywords })

    console.log('length', hydroFile.hypercore.length)

    // check the hypercore for a match
    // API: https://github.com/hypercore-protocol/hypercore
    const rootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)

    // TODO: For some reason, not drillign down into the object>??
    try {
      // const hello = await ipfs.dag.get(rootCID)
      // console.log({ hello })

      const helloDeep = await ipfs.dag.get(rootCID, { path: 'IPFSObject/hello.txt' })
      console.log(JSON.stringify(helloDeep.value.cid.toString(), null, 2)) // TypeError: string.startsWith is not a function
      console.log('base58BTC', helloDeep.value.cid.toV0().toString()) // .toV1().toString() .toString('base32')
      console.log('base32', helloDeep.value.cid.toV1().toString()) // .toV1().toString() .toString('base32')
    } catch (error) {
      console.error(error)
    }

    // expect(updatedThreadRootCID).to.equal('bafyreibblxeqpfhgjczn54rjvvh26ofhecudanluebrn2ntnodwilbv7uy')
    expect(updatedRootCID).to.equal('bafyreiajjh7zooh2hiqebnf6sspfm3wmgrxdhcuio4jhujsbnfopzoswwu')

    // expect(helloResults.toString()).to.equal(CID)
  })

it('should track multiple CIDs', async () => {
    const name = 'hello.txt' // name what you are saving
    const type = 'IPFSObject'
    const keywords = ['hello', 'text files'] // TODO: figure out how to search keywords amongst diff types
    const helloResults = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    // const { path, cid, mode, mtime } = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)


    const { updatedThreadRootCID, updatedRootCID } = await hydroFile.track(helloResults.cid, { name, type, keywords })

    console.log('length', hydroFile.hypercore.length)

    // check the hypercore for a match
    // API: https://github.com/hypercore-protocol/hypercore
    const rootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)

    // TODO: For some reason, not drillign down into the object>??
    try {
      // const hello = await ipfs.dag.get(rootCID)
      // console.log({ hello })

      const helloDeep = await ipfs.dag.get(rootCID, { path: 'IPFSObject/hello.txt' })
      const {cid} = await ipfs.add("Hello New World.")
      const res = await hydroFile.track(cid, {name, type, keywords})
      const newRootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)
      const helloVeryDeep = await ipfs.dag.get(newRootCID, { path: 'IPFSObject/hello.txt' })
      const prevObject = await ipfs.dag.get(helloVeryDeep.value.previous)
      expect(prevObject.value.cid.toV1().toString()).to.equal(helloDeep.value.cid.toV1().toString())
    } catch (error) {
      console.error(error)
    }
  })

  it('Mocked keyword search', async () => {
      hydroFile.insertKeyword("HI", 13)
      hydroFile.insertKeyword("HIi", 14)
      expect(hydroFile.getCIDsForKeyword('H')).deep.to.equal([13,14])
      expect(hydroFile.getCIDsForKeyword('HIi')).deep.to.equal([14])
  })

  it('should have keyword search', async () => {
    const name = 'hello.txt' // name what you are saving
    const type = 'IPFSObject'
    const keywords = ['hello', 'text files'] // TODO: figure out how to search keywords amongst diff types
    const helloResults = await ipfs.add('Hello world') // ipfs.add(fileObject)  //or// ipfs.dag.put(object)
    const randomFile = await ipfs.add()

    const { updatedThreadRootCID, updatedRootCID } = await hydroFile.track(helloResults.cid, { name, type, keywords })

    console.log('length', hydroFile.hypercore.length)

    // check the hypercore for a match
    // API: https://github.com/hypercore-protocol/hypercore
    const rootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)

    // TODO: For some reason, not drillign down into the object>??
    try {
      // const hello = await ipfs.dag.get(rootCID)
      // console.log({ hello })

      const helloDeep = await ipfs.dag.get(rootCID, { path: 'IPFSObject/hello.txt' })
      const {cid} = await ipfs.add("Hello New World.")
      const res = await hydroFile.track(cid, {name, type, keywords})
      const newRootCID = await hydroFile.hypercore.get(hydroFile.hypercore.length - 1)
      const helloVeryDeep = await ipfs.dag.get(newRootCID, { path: 'IPFSObject/hello.txt' })
      const prevObject = await ipfs.dag.get(helloVeryDeep.value.previous)
      expect(prevObject.value.cid.toV1().toString()).to.equal(helloDeep.value.cid.toV1().toString())
    } catch (error) {
      console.error(error)
    }

    // expect(updatedThreadRootCID).to.equal('bafyreibblxeqpfhgjczn54rjvvh26ofhecudanluebrn2ntnodwilbv7uy')
    // expect(updatedRootCID).to.equal('bafyreiajjh7zooh2hiqebnf6sspfm3wmgrxdhcuio4jhujsbnfopzoswwu')

    // expect(helloResults.toString()).to.equal(CID)
  })
})

