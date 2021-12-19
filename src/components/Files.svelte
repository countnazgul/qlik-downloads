<script lang="ts">
  import { Loading } from "carbon-components-svelte";
  import Pagination from "./Pagination.svelte";
  import { makeGetRequest, makeGetRequestWithoutPaging } from "../lib/comms";

  import type { Release, Repository } from "../lib/types";

  export let repository: Repository;
  let dataLoaded = false;
  let totalPages = 0;

  let releases: Release[] = [];

  async function loadReleases(repo: Repository): Promise<Release[]> {
    [releases] = await Promise.all([
      makeGetRequestWithoutPaging<Release>(
        `repos/qlik-download/${repo.name}/releases`
      ).then((r) => {
        totalPages = r.totalPages;
        return r.data.sort((a, b) => (a.tag_name > b.tag_name ? -1 : 1));
      }),
      new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          clearTimeout(wait);
          resolve("");
        }, 500);
      }),
    ]);

    return releases;
  }

  async function loadMore(page: number): Promise<Release[]> {
    [releases] = await Promise.all([
      makeGetRequestWithoutPaging<Release>(
        `repos/qlik-download/${repository.name}/releases?page=${page}`
      ).then((r) => {
        totalPages = r.totalPages;
        return r.data.sort((a, b) => (a.tag_name > b.tag_name ? -1 : 1));
      }),
      new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
          clearTimeout(wait);
          resolve("");
        }, 500);
      }),
    ]);

    return releases;
  }

  $: if (repository) {
    dataLoaded = false;
    loadReleases(repository).then((r) => {
      dataLoaded = true;
      releases = r;
    });
  }

  // $: console.log(releases);
</script>

<div class="files-container">
  {#if !dataLoaded}
    <Loading withOverlay={true} />
  {:else if releases.length > 0}
    <release-header>
      <div>RELEASE NAME</div>
      <div>VERSION</div>
      <div>SIZE</div>
      <div>DOWNLOAD</div>
    </release-header>
    <releases>
      <releases-list>
        {#each releases as release}
          <release>
            <div>{release.name}</div>
            <div>{release.tag_name}</div>
            <div>
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
          on:click:button--next={(ev) => loadMore(parseInt(ev.detail))}
          on:click:button--previous={(ev) => loadMore(parseInt(ev.detail))}
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
  }

  releases-list {
    overflow: auto;
    height: 100%;
    display: inline-block;
    width: 100%;
  }

  release {
    padding-top: 8px;
    padding-bottom: 8px;
    display: grid;
    grid-template-columns: 10fr 10fr 10fr 10fr;
  }

  release > div {
    padding-left: 5px;
  }

  release:hover {
    background-color: lightgray;
    color: black;
  }

  release-header {
    display: grid;
    grid-template-columns: 10fr 10fr 10fr 10fr;
    background-color: #059848;
    padding: 5px;
    /* height: 30px; */
  }

  release-header > div {
    font-size: 1.25rem;
    text-align: center;
    border-right: 1px solid;
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
</style>
