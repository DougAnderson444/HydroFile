# HydroFile

A small wrapper library to sail the seas of IPFS CIDs.

## Dream API

```js

    // instantiate a new HydroFile
    const hydroFile = new HydroFile()

    // or load a previously built HydroFile
    const hydro = 'badbeefbadbeefbadbeefbadbeefbadbeefbadbeefbadbeef'
    const hydroFile = new HydroFile(hydro)

    // TODO: load hydroFile id from Ethereum or ENS?

    // name the upload and optionally give it some more meta data, like previous version 
    const name = "hello.txt" // name what you are saving
    const CID = await hydroFile.track(await ipfs.add("Hello world"), { name: "hello.txt" , prevCID, keywords })

    // or syncronously
    ipfs.add("Hello world").then((CID)=>{
        hydroFile.track(CID, { name: "hello.txt" , prevCID, keywords })
    })

    const helloRotCID = hydroFile.getRoot(name)
    //  expect(helloRotCID).to.equal(CID)


    // all CIDs can be rolled up into one root CID
    const rootCID = hydroFile.getRoot()

    // get last 10 rootCIDs
    const rootCIDs = hydroFile.getRoot(10)

    fileCID = hydroFile.getFile("hello.txt")
    const [searchResults] = hydroFile.find("hello") // all CID objects with meta data including "hello" keyword

```



## Branches:

main

[json-ld](https://github.com/DougAnderson444/HydroFile/tree/ckartik/jsonld-experiment) (saved in IPLD)

[hyperbee](https://github.com/DougAnderson444/HydroFile/tree/ckartik/ipfs-hyperbee-mvp) (CIDs saved in a hypercore btree)

## Before you start
First clone this repo, install dependencies in the project root and build the project.

```bash
$ git clone https://github.com/DougAnderson444/HydroFile.git
$ cd hydrofile
$ npm install
$ npm run start
```

## Examples

### Currently working with:
- ...

### Planned support for examples using:
- Hyperbee
- Lowdash DB
- JSON LD
