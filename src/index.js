
// import { default as hyperSDK } from 'hyper-sdk'

import hyperSDK from 'hyper-sdk'
import * as IPFS from 'ipfs-core'

export class HydroFile {
  constructor (ipfs, { name = '', persist = true }) {
    this.ipfs = ipfs
    this.name = name || 'DEFAULT_NAME'
    this.persist = persist
  }

  async ready () {
    // set up IPFS/IPLD, a place to roll up CIDs
    this.ipfs = IPFS.create()

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

  async track (CID, params) {
    await CID // assuming it's a js promise that hasn't been fulfilled yet, let's wait for that
    return CID.toString()
  }
}
