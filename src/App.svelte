<script lang="ts">
  import { Loading, Theme } from "carbon-components-svelte";
  import BrightnessContrast24 from "carbon-icons-svelte/lib/BrightnessContrast24";
  import LogoGithub24 from "carbon-icons-svelte/lib/LogoGithub24";
  import "carbon-components-svelte/css/all.css";
  import { makeGetRequest } from "./lib/comms";
  import type { Repository, Release } from "./lib/types";
  import Files from "./components/Files.svelte";
  import type { CarbonTheme } from "carbon-components-svelte/types/Theme/Theme.svelte";

  let theme: CarbonTheme = "g90";
  $: fill = theme == "g90" ? "white" : "black";
  let selectedProduct: Repository = {} as Repository;

  async function loadData(): Promise<Repository[]> {
    let [repos] = await Promise.all([
      makeGetRequest<Repository[]>("orgs/qlik-download/repos").then((r) =>
        r.sort((a, b) => (a.description > b.description ? 1 : -1))
      ),
      new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          clearTimeout(wait);
          resolve("");
        }, 1000);
      }),
    ]);

    return repos;
  }

  async function loadReleases(repo: Repository): Promise<Release[]> {
    selectedProduct = repo;
    return [];
  }
</script>

<main>
  {#await loadData()}
    <Loading />
  {:then repos}
    <header>
      QLIK DOWNLOADS
      <switcher>
        <Theme
          bind:theme
          render="toggle"
          toggle={{
            themes: ["white", "g90"],
            hideLabel: true,
            labelA: "",
            labelB: "",
            size: "sm",
          }}
        />
      </switcher>
      <div class="theme-switcher">
        <div title="Toggle theme">
          <BrightnessContrast24
            style="fill: {fill}"
            on:click={() => {
              theme == "white" ? (theme = "g90") : (theme = "white");
            }}
          />
        </div>
        <a
          class="link"
          title="Source code"
          href="https://github.com/countnazgul/qlik-downloads"
          target="_blank"
        >
          <LogoGithub24 style="fill: {fill}" />
        </a>
      </div>
    </header>
    <products>
      <ul>
        {#each repos as repo}
          <li
            on:click={() => loadReleases(repo)}
            class:active={selectedProduct.name == repo.name}
          >
            <div title={repo.description} class="repo-name">
              {repo.description.replace(
                "Product Composition repository for ",
                ""
              )}
            </div>
          </li>
        {/each}
      </ul>
    </products>
    <files>
      {#if selectedProduct.id}
        <Files repository={selectedProduct} />
      {:else}
        <select-product>Please select one product</select-product>
      {/if}
    </files>
  {/await}
</main>

<style>
  main {
    display: grid;
    grid-template-columns: max-content auto;
    grid-template-rows: max-content auto;
    max-width: 240px;
    margin: 0 auto;
    height: 100%;
    overflow: hidden;
  }

  header {
    grid-row: 1;
    grid-column: 1 / span 2;
    font-size: 32px;
    background-color: #059848;
    color: white;
    border-bottom: 1px solid darkgray;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  products {
    overflow: auto;
    height: 100%;
    overflow: auto;
    grid-row: 2;
    grid-column: 1;
  }

  products > ul > li {
    padding: 5px;
    line-height: 1.25rem;
  }

  products > ul > li:hover {
    background-color: lightgray;
    color: black;
  }

  files {
    grid-row: 2;
    grid-column: 2;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .active {
    background-color: #059848;
    font-weight: bold;
  }

  .repo-name {
    cursor: pointer;
    padding-left: 5px;
  }

  switcher {
    display: none;
  }

  .theme-switcher {
    position: absolute;
    right: 10px;
    display: flex;
    gap: 5px;
    cursor: pointer;
  }

  select-product {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
