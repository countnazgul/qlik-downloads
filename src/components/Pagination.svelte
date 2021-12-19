<script>
  import CaretRight32 from "carbon-icons-svelte/lib/CaretRight32";
  import CaretLeft32 from "carbon-icons-svelte/lib/CaretLeft32";
  import { createEventDispatcher } from "svelte";

  export let totalPages;

  const dispatch = createEventDispatcher();

  let currentPage = 1;

  function navigationChange(position) {
    if (position == "previous") {
      currentPage--;
    }

    if (position == "next") {
      currentPage++;
    }

    dispatch(`click:button--${position}`, currentPage);
  }
</script>

<pagination>
  <div>Page {currentPage} of {totalPages}</div>
  <div />
  <div class="event" class:no-events={currentPage == 1}>
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
</pagination>

<style>
  pagination {
    /* background-color: red; */
    width: 100%;
    height: 50px;
    display: grid;
    grid-template-columns: 200px auto 50px 50px;
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
