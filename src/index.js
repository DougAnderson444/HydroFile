
import { default as hyperSDK } from 'hyper-sdk'

export class HydroFile {
  constructor (name = '') {
    this.name = name || 'DEFAULT_NAME'
  }

  async ready () {
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
}
