const baseUrl = "https://api.github.com";

export async function makeGetRequest<T>(
  path: string,
  getAll?: boolean
): Promise<T[]> {
  return await fetch(`${baseUrl}/${path}`).then(async (res): Promise<T[]> => {
    let links = res.headers.get("link");
    let pagingData = [];

    if (links && getAll) {
      const linksList = links.split(", <");
      const lastPage = linksList[1].substring(
        linksList[1].indexOf("=") + 1,
        linksList[1].lastIndexOf(">")
      );

      pagingData = await getAllPages<T>(
        `${baseUrl}/${path}`,
        parseInt(lastPage)
      ).then((r) => r.flat());
    }

    const responseData = await res.json();
    return [...responseData, ...pagingData];
  });
}

async function getAllPages<T>(url: string, maxPages: number): Promise<T[]> {
  let requests = [];

  for (let i = 2; i < maxPages + 1; i++) {
    console.log(`${url}?page=${i}`);
    requests.push(fetch(`${url}?page=${i}`).then((res) => res.json()));
  }

  const data = await Promise.all<T>(requests);

  return [...data];
}

export async function makeGetRequestWithoutPaging<T>(
  path: string
): Promise<{ data: T[]; totalPages: number }> {
  return await fetch(`${baseUrl}/${path}`).then(
    async (res): Promise<{ data: T[]; totalPages: number }> => {
      let links = res.headers.get("link");
      let totalPages: number;

      if (links) {
        const linksList = links.split(", <");
        totalPages = parseInt(
          linksList[1].substring(
            linksList[1].indexOf("=") + 1,
            linksList[1].lastIndexOf(">")
          )
        );
      }

      const responseData: T[] = await res.json();
      return { data: responseData, totalPages };
    }
  );
}
