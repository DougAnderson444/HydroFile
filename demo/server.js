/**
 This server needs a hyperspace daemon up and running in the background to work
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
/**
 Express stuff
 */
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

/**
 * IPFS
 */
import * as IPFS from 'ipfs-core'

/**
  Hydrofile
 */
import { HydroFile } from 'hydrofile'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()

let hydroFile

const app = express()
const port = process.env.PORT || 12345

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(cors())

const put = async (key, value) => {
  if (!key || !value) return
  key = key.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, '').toLowerCase()
  value = value.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, '').toLowerCase()
  if (!key || !value) return
  await hydroFile.track(key, value)
  const node = await hydroFile.get(key) // null or { key, value }
  console.log(`hydrofile: ${node.key}, ${node.value}`)
}

const getRange = async (frag) => {
  // get the string that is char + 1 from the fragment sent
  function getEnd (str) {
    const len = str.length
    if (len === 1) return String.fromCharCode(str.charCodeAt(0) + 1)
    // increment only the last charCodeAt
    const last = str.slice(-1)
    const remainder = str.slice(0, -1)
    return remainder + String.fromCharCode(last.charCodeAt(0) + 1)
  }
  const end = getEnd(frag)
  console.log(`Searching ${frag} to ${end}`)
  const results = []
  for await (const item of db.createReadStream({ gte: frag, lt: end })) {
    results.push(item)
  }
  return results
}
/**
  Express server routes
 */
app.get('/hydrofile/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.get('/hydrofile/keyword', (req, res) => {
  const params = request.body.params
  const {keyword} = params
  response.json({cids: hydroFile.getCIDsForKeyword(keyword)})
})

app.all('/hydrofile/search/:frag', async (request, response) => {
  const frag = request.params.frag
  if (!frag) return
  console.log('searching...', frag)

  const results = await getRange(frag)

  console.log('results: ', { results })
  response.json(results)
})

app.post('/hydrofile/track/', async (request, response) => {
  console.log('adding...')

  const cid = request.body.cid
  const params = request.body.params
  const { name, type, keywords } = params

  const { updatedThreadRootCID, updatedRootCID } = await hydroFile.track(cid, { name, type, keywords })

  console.log('posted: ', { cid, params }, { updatedRootCID }, { updatedThreadRootCID })
  response.json({ name, cid })
})

IPFS.create().then(async (ipfs) => {
  const id = await ipfs.id()
  console.log("Ipfs init'd", { id: id.id })
  hydroFile = new HydroFile(ipfs, { persist: false })
  hydroFile.ready().then(() => {
    const listener = app.listen(port, () => {
      console.log(`\nServer is up at http://localhost:${port}/hydrofile/`, listener.address())
    })
  })
})
