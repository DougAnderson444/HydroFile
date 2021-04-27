
// import { default as hyperSDK } from 'hyper-sdk'

import hyperSDK from 'hyper-sdk'
import * as IPFS from 'ipfs-core'

export class HydroFile {
  constructor (ipfs, { name = '', persist = true }) {
    this.ipfs = ipfs
    this.name = name || 'DEFAULT_NAME'
    this.persist = persist
    this.threadRoots = {} // default
    this.rootObj = {}
  }

  async ready () {
    // await this.ipfs // TOD: Figure out why I need this here?
    // console.log("2. Ipfs init'd")
    // set up hypercore, a place to save the CIDs under a mutable key (identity)
    const { Hypercore } = await hyperSDK({
      persist: true
    })

    // Create a hypercore
    // Check out the hypercore docs for what you can do with it
    // https://github.com/mafintosh/hypercore
    this.hypercore = Hypercore(this.name, {
      valueEncoding: 'json',
      persist: true
      // storage can be set to an instance of `random-access-*`
      // const RAI = require('random-access-idb')
      // otherwise it defaults to `random-access-web` in the browser
      // and `random-access-file` in node
    //   storage: null // storage: RAI
    })

    // You should wait for the drive to be totally initialized
    await this.hypercore.ready()
  }

  setRootCID (type, name, CID) {
    if (this.threadRoots[type] === undefined) this.threadRoots[type] = {} // initialize object if this is the first property
    this.threadRoots[type][name] = CID
  }

  getRootCID (type, name) {
    // first time this is accessed, there is no previous CID
    if (this.threadRoots[type] === undefined) this.threadRoots[type] = {} // initialize object if this is the first property
    return this.threadRoots[type][name] || false
  }

  async track (CID, params) {
    const { name, type, keywords } = params
    // get previous CID for this object name if it exists
    const prevThreadRootCID = this.getRootCID(type, name)

    // set the previous CID in the new object
    const updatedThreadRootObject = {
      '@context': {
        id: '@id',
        type: '@type'
      },
      id: `hypercore://${this.hypercore.key.toString('hex')}/${type}/${name}`,
      type,
      name,
      cid: CID,
      previous: prevThreadRootCID,
      keywords
    }

    // API: https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/DAG.md#ipfsdagputdagnode-options

    const updatedThreadRootCID = await this.ipfs.dag.put(updatedThreadRootObject)

    const updatedRootCID = await this.updateRootCID(type, name, updatedThreadRootCID)

    this.hypercore.append(updatedRootCID)

    return { updatedThreadRootCID, updatedRootCID }
  }

  async updateRootCID (type, name, updatedThreadRootCID) {
    // set up the object
    if (this.rootObj[type] === undefined) this.rootObj[type] = {} // initialize object if this is the first property

    this.rootObj[type][name] = updatedThreadRootCID // should this be a Map instead? Does it matter?

    console.log({ rootObj: this.rootObj })

    const updatedRootCID = await this.ipfs.dag.put(this.rootObj)
    return updatedRootCID // save this to hypercore, it's the root root CID
  }
}
