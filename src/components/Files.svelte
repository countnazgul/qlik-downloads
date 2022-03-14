<script lang="ts">
  import { Loading, Button, Modal } from "carbon-components-svelte";
  import Pagination from "./Pagination.svelte";
  import { makeGetRequest, makeGetRequestWithoutPaging } from "../lib/comms";
  import { extractRelease } from "../lib/util";
  import ChevronRight16 from "carbon-icons-svelte/lib/ChevronRight16";
  import type { ReleaseExtended, Repository } from "../lib/types";

  export let repository: Repository;

  const releaseElementHeight = 30;

  let releasesContainer: HTMLElement;
  let releasesContainerHeight: number;
  let allReleases: ReleaseExtended[] = [];
  let currentPage: ReleaseExtended[] = [];
  let dataLoaded = false;
  let downloadsModalOpen = false;
  let downloadsActiveRelease: ReleaseExtended;
  let downloadsModalHeading = "";

  $: releasesPerPage = releasesContainer
    ? Math.floor(Math.floor(releasesContainerHeight) / releaseElementHeight) - 2
    : -1;
  $: totalPages = Math.floor(allReleases.length / releasesPerPage);
  $: releasesPerPage > -1 && allReleases.length > 0
    ? (currentPage = allReleases.slice(0, releasesPerPage))
    : [];
  $: paginationHeight = releasesContainerHeight - releasesPerPage * 30;

  async function loadReleases(repo: Repository): Promise<ReleaseExtended[]> {
    [allReleases] = await Promise.all([
      makeGetRequest<ReleaseExtended>(
        `repos/qlik-download/${repo.name}/releases?per_page=50`,
        true
      ).then((r) => {
        // totalPages = r.totalPages;

        const rExtended: ReleaseExtended[] = r.map((r1) => {
          const a = extractRelease(r1.name);

          return { ...r1, ...a };
        });

        return rExtended.sort((a, b) => (a.qIndex > b.qIndex ? -1 : 1));
      }),
      new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          clearTimeout(wait);
          resolve("");
        }, 500);
      }),
    ]);

    return allReleases;
  }

  async function loadMore(page: number) {
    currentPage = allReleases.slice(
      (page - 1) * releasesPerPage,
      page * releasesPerPage
    );
  }

  $: if (repository) {
    dataLoaded = false;
    loadReleases(repository).then((r) => {
      dataLoaded = true;
      allReleases = r;
    });
  }
</script>

<div class="files-container">
  {#if !dataLoaded}
    <Loading withOverlay={true} />
  {:else if allReleases.length > 0}
    <release-header>
      <div>RELEASE NAME</div>
      <div>PATCH</div>
      <div>VERSION</div>
      <div>DOWNLOADS</div>
    </release-header>
    <releases
      bind:this={releasesContainer}
      bind:clientHeight={releasesContainerHeight}
    >
      <releases-list>
        {#each currentPage as release}
          <release>
            <div
              title={release.name}
              class:initial-release={release.qReleaseType == "0" ||
                release.qReleaseType.toLocaleLowerCase() == "initial release"}
            >
              {release.qRelease}
            </div>
            <div
              class:initial-release={release.qReleaseType == "0" ||
                release.qReleaseType.toLocaleLowerCase() == "initial release"}
            >
              {release.qReleaseType}
            </div>
            <div
              class:initial-release={release.qReleaseType == "0" ||
                release.qReleaseType.toLocaleLowerCase() == "initial release"}
            >
              {release.tag_name}
            </div>
            <div>
              {#if release.assets.length <= 2}
                <div class="downloads">
                  <div>
                    {#each release.assets as asset, i}
                      <a href={asset.browser_download_url} title={asset.name}
                        >{asset.name.substring(asset.name.lastIndexOf(".") + 1)}
                        ({Math.floor(Number(asset.size) / 1024 / 1024)} MB)</a
                      >
                      {#if i != release.assets.length - 1}
                        ,&nbsp;
                      {/if}
                    {/each}
                  </div>
                  <div class="show-downloads" title="Show all downloads">
                    <ChevronRight16
                      on:click={() => {
                        downloadsActiveRelease = release;
                        downloadsModalOpen = true;
                      }}
                    />
                  </div>
                </div>
              {/if}
              {#if release.assets.length > 2}
                <div class="downloads">
                  <Button
                    size="small"
                    kind="ghost"
                    on:click={() => {
                      downloadsActiveRelease = release;
                      downloadsModalOpen = true;
                    }}>Show all downloads</Button
                  >
                </div>
              {/if}
            </div>
          </release>
        {/each}
      </releases-list>
      {#if totalPages && totalPages > 0}
        <Pagination
          {totalPages}
          height={paginationHeight}
          on:click:button--position={(ev) => loadMore(parseInt(ev.detail))}
        />
      {/if}
    </releases>
  {:else}
    <no-releases>No releases available</no-releases>
  {/if}

  {#if downloadsActiveRelease}
    <Modal
      bind:open={downloadsModalOpen}
      modalHeading={`${repository.description.replace(
        "Product Composition repository for ",
        ""
      )} (${downloadsActiveRelease.name})`}
      passiveModal
      on:click:button--secondary={() => (downloadsModalOpen = false)}
      on:open={() => {
        // console.log(downloadsActiveRelease);
      }}
      on:close={() => {
        // downloadsActiveAssets = [];
      }}
    >
      <div class="downloads-all-modal">
        {#each downloadsActiveRelease.assets as asset}
          <a href={asset.browser_download_url} title={asset.name}
            >{asset.name}
            ({Math.floor(Number(asset.size) / 1024 / 1024)} MB)</a
          >
        {/each}
      </div>
    </Modal>
  {/if}
</div>

<style>
  .files-container {
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-rows: 30px auto;
  }
  releases {
    overflow: hidden;
    height: 100%;
    /* display: inline-block; */
    width: 100%;
    display: flex;
    flex-direction: column;
    scrollbar-gutter: both-edges;
  }

  releases-list {
    overflow: hidden;
    height: 100%;
    display: inline-block;
    width: 100%;
  }

  release {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  release > div {
    /* padding-top: 8px; */
    /* padding-bottom: 8px; */
    /* 
    padding-left: 5px; */
    padding: 8px;
    border-right: 1px solid;
  }

  release > div:nth-child(5) {
    display: flex;
    justify-content: center;
    gap: 5px;
  }

  release:hover {
    background-color: lightgray;
    color: black;
  }

  release-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    background-color: #059848;
    /* height: 30px; */
  }

  release-header > div {
    padding: 5px;
    font-size: 1.25rem;
    text-align: center;
    border-right: 1px solid var(--cds-text-01, #161616);
  }

  release > div {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
  }

  release-header > div {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
  }

  no-releases {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .initial-release {
    color: #059848;
    border-right: 1px solid var(--cds-text-01, #161616);
  }

  .downloads {
    display: flex;
  }

  .downloads-all-modal {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding-top: 10px;
  }

  .downloads-all-modal > a {
    padding-top: 5px;
  }

  .show-downloads {
    margin-left: auto;
    cursor: pointer;
  }
</style>
