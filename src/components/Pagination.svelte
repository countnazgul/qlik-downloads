<script>
  import CaretRight32 from "carbon-icons-svelte/lib/CaretRight32";
  import CaretLeft32 from "carbon-icons-svelte/lib/CaretLeft32";
  import SkipBackFilled20 from "carbon-icons-svelte/lib/SkipBackFilled20";
  import SkipForwardFilled20 from "carbon-icons-svelte/lib/SkipForwardFilled20";
  import { createEventDispatcher } from "svelte";

  export let totalPages;
  export let height;

  $: h = `${height + 10}px`;

  const dispatch = createEventDispatcher();

  let currentPage = 1;

  function navigationChange(position) {
    if (position == "previous") {
      currentPage--;
    }

    if (position == "next") {
      currentPage++;
    }

    if (position == "first") {
      currentPage = 1;
    }

    if (position == "last") {
      currentPage = totalPages;
    }

    dispatch(`click:button--position`, currentPage);
  }
</script>

<pagination style="--pagination-height: {h}">
  <div>Page {currentPage} of {totalPages}</div>
  <div />
  <div class="event" class:no-events={currentPage == 1}>
    <div
      class="navigation"
      class:disabled={currentPage == 1}
      title="First page"
      on:click={() => navigationChange("first")}
    >
      <SkipBackFilled20 />
    </div>
  </div>
  <div class="event last-button" class:no-events={currentPage == 1}>
    <div
      class="navigation"
      class:disabled={currentPage == 1}
      on:click={() => navigationChange("previous")}
      title="Previous page"
    >
      <CaretLeft32 />
    </div>
  </div>
  <div class="event last-button" class:no-events={currentPage == totalPages}>
    <div
      class="navigation"
      class:disabled={currentPage == totalPages}
      on:click={() => navigationChange("next")}
      title="Next page"
    >
      <CaretRight32 />
    </div>
  </div>
  <div class="event last-button" class:no-events={currentPage == totalPages}>
    <div
      class="navigation"
      class:disabled={currentPage == totalPages}
      title="Last page"
      on:click={() => navigationChange("last")}
    >
      <SkipForwardFilled20 />
    </div>
  </div>
</pagination>

<style>
  pagination {
    width: 100%;
    /* height: 50px; */
    height: var(--pagination-height);
    display: grid;
    grid-template-columns: 200px auto 50px 50px 50px 50px;
    border-top: 1px solid;
  }

  pagination > div {
    display: flex;
    align-items: center;
  }

  .event {
    justify-content: center;
  }

  pagination div:first-of-type {
    padding-left: 5px;
  }

  .navigation {
    display: flex;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
  }

  .disabled {
    pointer-events: none;
  }

  .no-events {
    cursor: not-allowed;
  }

  .last-button {
    border-left: 1px solid;
  }
</style>
