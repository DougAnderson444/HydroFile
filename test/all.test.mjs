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

  it('expect default hydroFile id to be 42', () => {
    hydroFile = new HydroFile()

    expect(hydroFile.id).to.equal(42)
  })
})
