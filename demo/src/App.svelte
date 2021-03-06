<script>
	import { onMount } from "svelte";
	import Autocomplete from "./components/autocomplete.svelte";
	import IPFSTree from "./components/IPFSTree.svelte";
	// IPFS saver
	import { default as IPFS, CID } from "ipfs-browser-global";
	import multihashing from "multihashing-async";
	import { setContext } from 'svelte';
	export let cols = {}
	function getRandomColor(cid) {
		if (cols[cid] !== undefined){
		return cols[cid]
		}
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
		}
		cols[cid] = color
		return color;
  	}
	setContext('getCol', getRandomColor)

	let name, keywords;
	let type = "text";
	let rootCID;
	let mounted;
	let data;
	let expanded = false;
	let ipfsNode;

	let allValues = new Map();

	const searchParams = new URLSearchParams(window.location.search);
	const TOKEN = searchParams.get("TOKEN");
	const HYPERBEE_KEY = searchParams.get("KEY"); // place your key in the querystring

	onMount(async () => {
		await IPFS();
		// get latest rootCID
		ipfsNode = ipfs;
		const resp = await fetch(`/hydrofile/root/`, { method: "GET" });
		rootCID = await resp.text();
		console.log(rootCID);
		mounted = true;
	});

	const handleSubmit = async () => {
		const file = {
			path: `${type}/${name}.txt`, // don't really have to do this, but we can
			content: data, // this is the important piece here
		};
		const { cid } = await ipfs.add(file); // this is what we want here
		if (!name || !type || !cid) return;
		let dataObj = {
			cid: cid.toString(),
			params: { name, type, keywords },
		};
		const resp = await postData(`/hydrofile/track/`, dataObj);
		rootCID = resp.updatedRootCID;
		console.log("handlesubmit", rootCID);

		// refresh issue??
		expanded = false;

		data = "";
		name = "";
		keywords = "";
	};

	// POST is default method, but can be replaced by other methods
	async function postData(url, data = {}, method = "POST") {
		if (!url || !data) return;
		const response = await fetch(url, {
			method: method || "POST", // *GET, POST, PUT, DELETE, etc.
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data), // body data type must match "Content-Type" header
		});
		return await response.json(); // parses JSON response into native JavaScript objects
	}

	const searchInputHandler = async (search) => {
		search = search.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, "");
		if (!search) return false;
		return await postData(`/hydrofile/search/${search}`, {});
	};

	const onChange = async () => {
		if (name)
			name = name
				.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, "")
				.toLowerCase();

		if (id)
			id = id
				.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, "")
				.toLowerCase();
	};
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
	/>
</svelte:head>
<main>
	<h1>HydroFile Demo!</h1>
	<p>
		Create an object to save to IPFS, then sail the seas of CIDs with your
		objects.
	</p>
	<p>
		Library located at <a
			href="https://github.com/DougAnderson444/HydroFile">GitHub</a
		>
	</p>
	{#if mounted && ipfsNode}IPFS Ready{/if}

	<div class="container">
		<form
			class="card card-body mb-3 bg-light"
			on:submit|preventDefault={handleSubmit}
		>
			<div class="form-group">
				<label for="exampleFormControlInput1"
					><h2>HydroFile - Sail the CIDs</h2></label
				>
			</div>

			<div class="form-group">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="input-group-text" id="inputGroupPrepend2"
							>File Name:</span
						>
					</div>
					<input
						type="text"
						class="form-control"
						placeholder="filename"
						bind:value={name}
					/>
				</div>
			</div>

			<div class="form-group">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="input-group-text" id="inputGroupPrepend2"
							>File Type:</span
						>
					</div>
					<input
						type="text"
						class="form-control"
						placeholder="Text"
						bind:value={type}
					/>
				</div>
			</div>

			<div class="form-group">
				<div class="input-group">
					<div class="input-group-prepend">
						<span class="input-group-text" id="inputGroupPrepend2"
							>Keywords:</span
						>
					</div>
					<input
						type="text"
						class="form-control"
						placeholder="hello"
						bind:value={keywords}
					/>
				</div>
			</div>
			<p>What do you want to save?</p>

			<textarea bind:value={data} />
			<button
				class="raised"
				disabled={!name || !type || !data}
				on:click={handleSubmit}
			>
				Save
			</button>
		</form>
	</div>

	<Autocomplete {searchInputHandler} /> (TODO: For future implementation)

	<div>
		{#if rootCID}
			<p style="margin: 1em; padding: 1em;">
				Rollup rootCID:
				<a
					href="https://explore.ipld.io/#/explore/{rootCID}"
					target="_blank">{rootCID}</a
				>
			</p>
			<IPFSTree key={"My HydroFiles"} val={rootCID} bind:expanded />
			<!-- <svelte:component
			this={IPFSTree}
			key={"My HydroFiles"}
			bind:val={rootCID}
			expanded={true}
		/> -->
		{/if}
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		font-size: 2em;
		font-weight: 100;
		margin: 1em;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.container {
		margin: auto;
		padding: 1em;
	}
</style>
