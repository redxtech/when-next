import bent from 'bent'

export default class TraktAPI {
  // private fields
  api_key

  constructor(api_key) {
    // initialize the instance with the api key
    this.api_key = api_key
  }

  createHeaders(token = false) {
    // create the default headers
    const headers = {
      'Content-Type': 'application/json',
      'trakt-api-key': this.api_key,
      'trakt-api-version': '2'
    }

    // add an oauth header if a token is supplied
    if (token) headers['Authorization'] = `Bearer ${token}`

    // return the completed headers object
    return headers
  }

  get({ path, extended = false, token = false, status = 200 }) {
    try {
      return bent(
        'https://api.trakt.tv',
        'GET',
        'json',
        this.createHeaders(token),
        status
      )(`${path}${extended ? '?extended=full' : ''}`)
    } catch (err) {
      const message = `GET request to ${path} failed (token=${!!token}).`
      console.error(message)
      throw new Error(message)
    }
  }

  post({ path, token, body, status = 200 }) {
    try {
      return bent(
        `https://api.trakt.tv`,
        'POST',
        'json',
        status
      )(path, body, this.createHeaders(token))
    } catch (err) {
      const message = `POST request to ${path} failed.`
      console.error(message)
      throw new Error(message)
    }
  }

  getShow(id) {
    return this.get({ path: `/shows/${id}` })
  }

  getNextEpisode(id) {
    return this.get({ path: `/shows/${id}/next_episode`, extended: true })
  }

  getUserLists(token) {
    return this.get({ path: '/users/me/lists', token })
  }

  getUserWhenListItems(token) {
    return this.get({
      path: '/users/me/lists/when/items/shows',
      token
    })
  }

  createUserWhenList(token) {
    return this.post({
      path: '/users/me/lists',
      token,
      body: {
        name: 'when.',
        description: 'List of shows to track on when. by @RedXTech.'
      },
      status: 201
    })
  }

  addShowToUserWhenList(token, id) {
    return this.post({
      path: '/users/me/lists/when/items',
      token,
      body: { shows: [{ ids: { slug: id } }] },
      status: 201
    })
  }

  removeShowFromUserWhenList(token, id) {
    return this.post({
      path: '/users/me/lists/when/items/remove',
      token,
      body: { shows: [{ ids: { slug: id } }] }
    })
  }

  getDefaultListItems() {
    return this.get({
      path: '/users/redxtech/lists/default-when-list/items/shows'
    })
  }

  getOAuthURL(origin) {
    return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${this.api_key}&redirect_uri=${origin}`
  }

  async getOAuthToken(code) {
    return ''
  }

  async revokeOAuthToken(token) {
    return ''
  }

  async checkOAuthToken(token) {
    try {
      const res = await this.get({
        path: '/users/me',
        token: token + '3',
        status: [200, 401]
      })
      return !!res
    } catch (e) {
      return new Promise((resolve, reject) => {
        reject(e)
      })
    }
  }

  userHasWhenList(lists) {
    // noinspection JSUnresolvedVariable
    return lists.some(list => list.ids.slug === 'when' && list.name === 'when.')
  }
}