<script lang="ts">
  import { Loading, Theme, Modal } from "carbon-components-svelte";
  import BrightnessContrast24 from "carbon-icons-svelte/lib/BrightnessContrast24";
  import InformationFilled24 from "carbon-icons-svelte/lib/InformationFilled24";
  import LogoGithub24 from "carbon-icons-svelte/lib/LogoGithub24";
  import "carbon-components-svelte/css/all.css";
  import { makeGetRequest } from "./lib/comms";
  import { productsList } from "./lib/util";
  import type { Repository, Release, RepositoryExtended } from "./lib/types";
  import Files from "./components/Files.svelte";
  import type { CarbonTheme } from "carbon-components-svelte/types/Theme/Theme.svelte";

  let theme: CarbonTheme = "g90";
  let selectedProduct: Repository = {} as Repository;
  let infoModalOpen = false;

  $: fill = theme == "g90" ? "white" : "black";

  const reposToExclude: string[] = [
    "For argocd config files and application files for forts, data gateway and any other projects",
  ];

  async function loadData(): Promise<RepositoryExtended[]> {
    let [repos] = await Promise.all([
      makeGetRequest<Repository>("orgs/qlik-download/repos", true).then((r) => {
        let rIndex: RepositoryExtended[] = r.map((r) => ({
          ...r,
          qIndex: productsList.indexOf(
            r.description.replace("Product Composition repository for ", "")
          ),
        }));

        // r.sort((a, b) => (a.description > b.description ? 1 : -1));
        rIndex.sort((a, b) => (a.qIndex > b.qIndex ? -1 : 1));

        return rIndex;
      }),
      new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          clearTimeout(wait);
          resolve("");
        }, 500);
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
      <div>QLIK DOWNLOADS</div>
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
        <div
          class="link"
          title="Info"
          on:click={() => (infoModalOpen = !infoModalOpen)}
        >
          <InformationFilled24 style="fill: {fill}" />
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
          {#if !reposToExclude.includes(repo.description.replace("Product Composition repository for ", ""))}
            <li
              on:click={() => loadReleases(repo)}
              class:active={selectedProduct.name == repo.name}
            >
              <div title={repo.description} class="repo-name">
                {repo.description
                  .replace("Product Composition repository for ", "")
                  .substring(0, 50)}
              </div>
            </li>
          {/if}
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

  <Modal
    passiveModal
    bind:open={infoModalOpen}
    modalHeading="Information"
    on:open
    on:close
  >
    <div>
      Author: Stefan Stoichev ( <a
        href="https://twitter.com/countnazgul"
        target="_blank">@countnazgul</a
      >
      |
      <a href="https://sstoichev.eu" target="_blank">sstoichev.eu</a> |
      <a href="https://github.com/countnazgul" target="_blank">GitHub</a> |
      <a
        href="https://stackoverflow.com/users/159365/stefan-stoichev"
        target="_blank">Stack Overflow</a
      >
      )
    </div>
    <div>&nbsp;</div>
    <div>
      The data is sourced from Qlik's public <a
        href="https://github.com/orgs/qlik-download/repositories"
        target="_blank">GitHub repositories</a
      >
    </div>
    <div>&nbsp;</div>
    <div><strong>"Qlik Downloads" is not affiliated with Qlik</strong></div>
  </Modal>
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

  header > div:first-of-type {
    color: var(--cds-text-01, #161616);
  }

  products {
    overflow: auto;
    height: 100%;
    grid-row: 2;
    grid-column: 1;
    border-right: 1px solid darkgray;
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
