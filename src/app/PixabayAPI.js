import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const API_PIXABAY_KEY = '37343908-f33eda8877a369f1440022b81';

export class PixabayAPI {
  #page = 1;
  #per_page = 40;
  #query = '';
  #totalPages = 0;
  async getPhotos() {
    const params = {
      page: this.#page,
      per_page: this.#per_page,
      q: this.#query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    };
    const URL_AXIOS = `?key=${API_PIXABAY_KEY}`;
    const { data } = await axios.get(URL_AXIOS, { params });
    return data;
  }
  get query() {
    this.#query;
  }
  set query(newQuery) {
    this.#query = newQuery;
  }
  incrementPage() {
    this.#page += 1;
  }
  resetPage() {
    this.#page = 1;
  }
  setTotal(total) {
    this.#totalPages = total;
  }
  hasMorePhotos() {
    return this.#page < Math.ceil(this.#totalPages / this.#per_page);
  }
}
