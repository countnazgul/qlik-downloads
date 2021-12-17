<script lang="ts">
  import { makeGetRequest } from "../lib/comms";

  import type { Release, Repository } from "../lib/types";

  export let repository: Repository;
  let dataLoaded = false;

  let releases: Release[] = [];

  async function loadReleases(repo: Repository): Promise<Release[]> {
    return await makeGetRequest<Release[]>(
      `repos/qlik-download/${repo.name}/releases`
    );
  }

  $: if (repository) {
    dataLoaded = false;
    loadReleases(repository).then((r) => {
      dataLoaded = true;
      releases = r;
    });
  }

  $: console.log(releases);
</script>

<div class="files-container">
  {#if releases.length > 0}
    <release-header>
      <div>Name</div>
      <div>Version</div>
      <div>Size</div>
      <div>Download</div>
    </release-header>
    <releases>
      {#each releases as release}
        <release>
          <div>{release.name}</div>
          <div>{release.tag_name}</div>
          <div>
            {Math.floor(Number(release.assets[0].size) / 1024 / 1024)} MB
          </div>
          <div>
            <a href={release.assets[0].browser_download_url}>Link</a>
          </div>
        </release>
      {/each}
    </releases>
  {/if}
</div>

<style>
  .files-container {
    height: 100%;
    overflow: hidden;
  }
  releases {
    overflow: auto;
    height: 100%;
    display: inline-block;
    width: 100%;
  }
  release {
    display: flex;
  }

  release-header {
    display: flex;
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
</style>
