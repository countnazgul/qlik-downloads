<script lang="ts">
  import { makeGetRequest } from "./lib/comms";
  import type { Repository, Release } from "./lib/types";
  import Files from "./components/Files.svelte";

  let selectedProduct: Repository;

  async function loadData(): Promise<Repository[]> {
    return await makeGetRequest<Repository[]>("orgs/qlik-download/repos");
  }

  async function loadReleases(repo: Repository): Promise<Release[]> {
    selectedProduct = repo;
    return [];
    // const a = await makeGetRequest<Release[]>(
    //   `repos/qlik-download/${repo.name}/releases`
    // );

    // console.log(a);
    // return a;
  }
</script>

<main>
  {#await loadData()}
    Loading ...
  {:then repos}
    <products>
      {#each repos as repo}
        <div on:click={() => loadReleases(repo)}>
          {repo.description.replace("Product Composition repository for ", "")}
        </div>
      {/each}
    </products>
    <files>
      <Files repository={selectedProduct} />
    </files>
  {/await}
</main>

<style>
  main {
    display: flex;
    /* text-align: center; */
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
    height: 100%;
    overflow: hidden;
  }

  products {
    overflow: auto;
    height: 100%;
    overflow: auto;
  }

  files {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  } */

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
