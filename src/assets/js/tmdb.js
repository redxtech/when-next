import bent from 'bent'

export default class TmdbAPI {
  // private fields
  api_key

  constructor(api_key) {
    // initialize the instance with the api key
    this.api_key = api_key
  }

  get(path, status = 200) {
    try {
      return bent('https://api.themoviedb.org/3', 'GET', 'json', status)(path)
    } catch (err) {
      throw new Error(`GET request to ${path} failed.`)
    }
  }

  async getPoster(id) {
    const { poster_path } = await this.get(`/tv/${id}?api_key=${this.api_key}`)
    return poster_path
  }

  async getPosterPath(id, width = 500) {
    return `https://image.tmdb.org/t/p/w${width}/${await this.getPoster(id)}`
  }
}
