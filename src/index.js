
// import { default as hyperSDK } from 'hyper-sdk'

import hyperSDK from 'hyper-sdk'
import _ from 'lodash'

class TrieNode {
  constructor (cid) {
    this.children = {}
    this.cid = cid
  }
}

export class HydroFile {
  constructor (ipfs, { name = '', persist = true }) {
    this.ipfs = ipfs
    this.name = name || 'DEFAULT_NAME'
    this.persist = persist
    this.threadRoots = {} // default
    this.rootObj = {}
    this.keywordTrie = new TrieNode(null)
  }

  async ready () {
    // await this.ipfs // TOD: Figure out why I need this here?
    // console.log("2. Ipfs init'd")
    // set up hypercore, a place to save the CIDs under a mutable key (identity)
    const { Hypercore } = await hyperSDK({
      persist: this.persist
    })

    // Create a hypercore
    // Check out the hypercore docs for what you can do with it
    // https://github.com/mafintosh/hypercore
    this.hypercore = Hypercore(this.name, {
      valueEncoding: 'json',
      persist: this.persist
      // storage can be set to an instance of `random-access-*`
      // const RAI = require('random-access-idb')
      // otherwise it defaults to `random-access-web` in the browser
      // and `random-access-file` in node
    //   storage: null // storage: RAI
    })

    // You should wait for the drive to be totally initialized
    await this.hypercore.ready()
  }

  getCIDsForKeyword(keyword){
    let node = this.keywordTrie
    const cids = []
    for (var i = 0; i < keyword.length; i++) {
      if(!node.children[keyword[i]]){
        return cids
      }
      node = node.children[keyword[i]]
    }
    this.findAllCIDsAtNode(node, cids)
    return cids
  }

  findAllCIDsAtNode(node, cids) {
    if (node.cid){
      cids.push(node.cid)
    }
    if (!_.isEmpty(node.children)){
      for (const child in node.children){
        this.findAllCIDsAtNode(node.children[child], cids)
      }
    }
  }

  insertKeyword(keyword, cid) {
    let node = this.keywordTrie
    for (var i = 0; i < keyword.length; i++){
      if (!node.children[keyword[i]]) {
        node.children[keyword[i]] = new TrieNode(null)
      }
      node = node.children[keyword[i]]
    }

    node.cid = cid
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
      id: `hypercore://${this.hypercore.key.toString('hex')}/${type}/${name}`, // This value changes on each iteration causing issues.
      type,
      name,
      cid: CID,
      previous: prevThreadRootCID,
      keywords
    }

    // API: https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/DAG.md#ipfsdagputdagnode-options

    const updatedThreadRootCID = await this.ipfs.dag.put(updatedThreadRootObject) // Note(@DougAnderson444): This is going to return arbitrary values because of hypercore key.
    try{
      _.forEach(keywords, (value) => this.insertKeyword(value, updatedThreadRootCID))
    } catch (err){
      console.error(err)
    }

    // Do we want to only change the root CID when there is an issue at the root.
    this.setRootCID(type, name, updatedThreadRootCID)

    const updatedRootCID = await this.updateRootCID(type, name, updatedThreadRootCID)

    await this.hypercore.append(updatedRootCID) // need to save the JS object

    return { updatedThreadRootCID, updatedRootCID }
  }

  async updateRootCID (type, name, updatedThreadRootCID) {
    // set up the object
    if (this.rootObj[type] === undefined) this.rootObj[type] = {} // initialize object if this is the first property

    this.rootObj[type][name] = updatedThreadRootCID // should this be a Map instead? Does it matter?
    // console.log("Root Object value: ", this.rootObj)
    const updatedRootCID = await this.ipfs.dag.put(this.rootObj)
    return updatedRootCID.toString() // save this to hypercore, it's the root root CID
  }
}
