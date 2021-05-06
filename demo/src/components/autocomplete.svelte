<script>
  export let searchInputHandler;

  let search = "";

  let list;
  let input;
  let isOpen = false;
  let arrowCounter = 0;
  let isLoading = false;
  let fromStart = true; // Default type ahead
  let maxItems = 5;
  let searchResults;
  let results;

  const onChange = async () => {
    isOpen = true;
    search = search.replace(/[`~!@#$%^&*()|+=?;:'",.<>\{\}\[\]\\\/]/gi, "");
    if (search) {
      searchResults = await searchInputHandler(search);
      filterResults();
    }
  };

  const regExpEscape = (s) => {
    return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  function filterResults() {
    if (!searchResults) return;
    results = searchResults
      .filter((item) => {
        if (typeof item !== "string") {
          item = item.key || ""; // Silent fail
        }
        return fromStart
          ? item.toUpperCase().startsWith(search.toUpperCase())
          : item.toUpperCase().includes(search.toUpperCase());
      })
      .map((item) => {
        const text = typeof item !== "string" ? item.key : item;
        return {
          key: text,
          value: item.value || item,
          label:
            search.trim() === ""
              ? text
              : text.replace(
                  RegExp(regExpEscape(search.trim()), "i"),
                  "<span>$&</span>"
                ),
        };
      });
    const height = results.length > maxItems ? maxItems : results.length;
    list.style.height = `${height * 2.25}rem`;
  }

  function onKeyDown(event) {
    if (event.keyCode === 40 && arrowCounter < results.length) {
      // ArrowDown
      arrowCounter = arrowCounter + 1;
    } else if (event.keyCode === 38 && arrowCounter > 0) {
      // ArrowUp
      arrowCounter = arrowCounter - 1;
    } else if (event.keyCode === 13) {
      // Enter
      event.preventDefault();
      console.log("Enter", arrowCounter);
      if (arrowCounter === -1) {
        arrowCounter = 0; // Default select first item of list
      }
      close(arrowCounter);
    } else if (event.keyCode === 27) {
      // Escape
      event.preventDefault();
      console.log("Escape", arrowCounter, event.keyCode);
      close();
    }
  }

  function close(index = -1) {
    isOpen = false;
    arrowCounter = -1;
    input.blur();
    if (index > -1) {
      const { key, value } = results[index];
      search = key;
    } else if (!value) {
      search = "";
    }
  }
</script>

<svelte:window
  on:click={() => {
    isOpen = false;
  }}
/>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
</svelte:head>

<div class="container">
  <div class="content">
    <div class="field">
      <label class="label" for="autocomplete">Search</label>
      <div on:click|stopPropagation class="autocomplete">
        <input
          type="text"
          id="search"
          name="search"
          bind:value={search}
          on:input={onChange}
          on:focus={() => {
            isOpen = true;
          }}
          on:keydown={onKeyDown}
          placeholder="Search"
          bind:this={input}
        />
        <ul
          class="autocomplete-results{!isOpen ? ' hide-results' : ''}"
          bind:this={list}
        >
          {#if results}
            {#each results as result, i}
              <li
                on:click={() => close(i)}
                class="autocomplete-result{i === arrowCounter
                  ? ' is-active'
                  : ''}"
              >
                {@html result.label}
                {result.value}
              </li>
            {/each}
          {/if}
        </ul>
        {#if isLoading}
          <slot>
            <p class="fallback">Loading data...</p>
          </slot>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 192px;
  }
  * {
    box-sizing: border-box;
  }

  input {
    height: 2rem;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }

  .autocomplete {
    position: relative;
  }

  .hide-results {
    display: none;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    border: 1px solid #dbdbdb;
    height: 6rem;
    overflow: auto;
    width: 100%;

    background-color: white;
    box-shadow: 2px 12px 24px rgba(0, 0, 0, 0.2);
    position: absolute;
    z-index: 100;
  }

  .autocomplete-result {
    color: #7a7a7a;
    list-style: none;
    text-align: left;
    height: 2rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }

  .autocomplete-result > :global(span) {
    background-color: none;
    color: #242424;
    font-weight: bold;
  }

  .autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #dbdbdb;
  }
</style>
