<script lang="ts">
  import { Loading } from "carbon-components-svelte";
  import Pagination from "./Pagination.svelte";
  import { makeGetRequest, makeGetRequestWithoutPaging } from "../lib/comms";
  import { extractRelease } from "../lib/util";

  import type { ReleaseExtended, Repository } from "../lib/types";

  export let repository: Repository;

  const releaseElementHeight = 30;

  let releasesContainer: HTMLElement;
  let releasesContainerHeight: number;
  let allReleases: ReleaseExtended[] = [];
  let currentPage: ReleaseExtended[] = [];
  let dataLoaded = false;

  $: releasesPerPage = releasesContainer
    ? Math.floor(Math.floor(releasesContainerHeight) / releaseElementHeight) - 2
    : -1;
  $: totalPages = Math.floor(allReleases.length / releasesPerPage);
  $: releasesPerPage > -1 && allReleases.length > 0
    ? (currentPage = allReleases.slice(0, releasesPerPage))
    : [];
  $: paginationHeight = releasesContainerHeight - releasesPerPage * 30;
  $: console.log(
    releasesContainerHeight,
    releasesPerPage * 30,
    paginationHeight
  );

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
      <div>EXE SIZE</div>
      <div>DOWNLOAD</div>
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
              class:initial-release={release.qReleaseType == "0"}
            >
              {release.qRelease}
            </div>
            <div class:initial-release={release.qReleaseType == "0"}>
              {release.qReleaseType}
            </div>
            <div class:initial-release={release.qReleaseType == "0"}>
              {release.tag_name}
            </div>
            <div class:initial-release={release.qReleaseType == "0"}>
              {Math.floor(Number(release.assets[0].size) / 1024 / 1024)} MB
            </div>
            <div>
              <a href={release.assets[0].browser_download_url}>exe</a> |
              <a
                href={`https://github.com/qlik-download/${
                  release.url.split("/")[5]
                }/archive/refs/tags/${release.tag_name}.zip`}>zip</a
              >
              |
              <a
                href={`https://github.com/qlik-download/${
                  release.url.split("/")[5]
                }/archive/refs/tags/${release.tag_name}.tar.gz`}>tar.gz</a
              >
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
    scrollbar-gutter: stable both-edges;
  }

  releases-list {
    overflow: hidden;
    height: 100%;
    display: inline-block;
    width: 100%;
  }

  release {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
</style>
