const baseUrl = "https://api.github.com";

export async function makeGetRequest<T>(path: string): Promise<T> {
  return await fetch(`${baseUrl}/${path}?per_page=100`).then((res) =>
    res.json()
  );
}
