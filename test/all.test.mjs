// test.mjs
import { HydroFile } from '../src/index.js'
import assert from 'assert'
import chai from 'chai'
const expect = chai.expect

let hydroFile

describe('Test', function () {
  beforeEach(function () {
    // runs once before the first test in this block
  })

  it('expect to be able to make a hydroFile object with a on zero id', async () => {
    hydroFile = new HydroFile()
    await hydroFile.ready()

    expect(hydroFile.hypercore.key.toString('hex')).to.have.lengthOf(64)
  })
})
