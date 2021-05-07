<script>
  import { onMount } from "svelte";
  import { default as IPFS, CID } from "ipfs-browser-global";

  export let breadcrumbs = []; // keys that lead back to the top
  export let key;
  export let val;
  export let expanded = false;

  let object, mounted;

  onMount(async () => {
    if (!ipfs) await IPFS();
    isValCID();
    mounted = true;
  });

  async function isValCID() {
    let isCID;

    try {
      isCID = CID.isCID(val) || CID.isCID(new CID(val));
    } catch (error) {
      // console.error("isCID Error: \n", error); // it's not really an error if the val isn't a CID. CID just doesn't handle checking non-CIDs very nicely
    }

    if (isCID) {
      console.log("Val is already CID obj", val);
      try {
        const result = await ipfs.dag.get(val, { timeout: 3000 });
        console.log("Val is now obj", { result });
        val = result.value;
      } catch (error) {
        console.error("ipfs.dag.get Error: \n", error);
      }
    }
    return val;
  }

  async function valToCID(vals) {
    console.log("Val is a CID, fetching obj from IPFS", { val });

    let { codec, version, hash } = vals;

    hash = await multihashing(new Uint8Array(hash), "sha2-256");
    return new CID(version, codec, hash);
  }

  function toggle() {
    expanded = !expanded;
    isValCID();
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
</svelte:head>

<section>
  {#if mounted}
    <div>
      <span class:menuclosed={!expanded} on:click={toggle} />
      <span class:expanded on:click={toggle}>{key}</span>
      {#if expanded}
        <ul>
          {#each [...Object.entries(val)] as [key, val]}
            <li>
              <!-- {key}: {JSON.stringify(val, null, 2)} -->
              {#if typeof val === "object"}
                <svelte:self
                  {key}
                  {val}
                  breadcrumbs={breadcrumbs.concat(key)}
                />
              {:else}{key != "value" ? key : ""}: {val}{/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</section>

<style>
  section {
    font-size: 0.85rem;
  }
  span {
    background-size: 1em 1em;
    font-weight: bold;
    cursor: pointer;
  }
  .menuclosed:before {
    content: "\01F4C1";
    font: normal normal normal 1.5em/1 FontAwesome;
    color: #ccc;
    padding-right: 0.1em;
    margin-right: 0.1em;
  }
  .expanded:before {
    content: "📂";
    font: normal normal normal 1.5em/1 FontAwesome;
    color: #ccc;
    padding-right: 0.1em;
    margin-right: 0.1em;
  }

  ul {
    padding: 0.2em 0 0 0em;
    margin: 0 0 0 0em;
    list-style: none;
    border-left: 1px solid #ddd;
  }

  li {
    padding: 0.2em 0;
    margin: 0.15em 1em;
  }
  div {
    text-align: left;
  }
</style>
