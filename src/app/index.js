import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './createMarkup';
import { PixabayAPI } from './PixabayAPI';
import { refs } from './refs';
import { notifyInit } from './notifyInit';
import { spinnerPlay, spinnerStop } from './spinner';

const modalLightBoxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

spinnerPlay();

window.addEventListener('load', () => {
  console.log('Loading completed');
  spinnerStop();
});

refs.btnLoadMore.classList.add('is-hidden');

const pixabay = new PixabayAPI();

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const loadMorePhotos = async function (entires, observer) {
  entires.forEach(async entry => {
    if (entry.isInteresting) {
      observer.unobserve(entry.target);
      pixabay.incrementPage();
      spinnerPlay();
      try {
        spinnerPlay();

        const { hits } = await pixabay.getPhotos();
        const markup = createMarkup(hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        if (pixabay.hasMorePhotos) {
          const lastItem = document.querySelector('.gallerry a:last-child');
          observer.observe(lastItem);
        } else
          Notify.info(
            "We're sorry, but you've reached the end of search results.",
            notifyInit
          );
        modalLightBoxGallery.refresh();
        scrollPage();
      } catch (error) {
        Notify.failure(error.message, 'Something going wrong!', notifyInit);
        clearPage();
      } finally {
        spinnerStop();
      }
    }
  });
};

const observer = new IntersectionObserver(loadMorePhotos, options);

const onSubmitClick = async event => {
  event.preventDefault();
  const {
    elements: { searchQuery },
  } = event.target;
  const search_query = searchQuery.value.trim().toLowerCase();

  if (!search_query) {
    clearPage();
    Notify.info('Entry data to search!', notifyInit);
    refs.searchInput.placeholder = 'What`re we looking for?';
    return;
  }
  pixabay.query = search_query;

  clearPage();

  try {
    spinnerPlay();
    const { hits, total } = await pixabay.getPhotos();
    if (hits.length === 0) {
      Notify.failure(
        `Sorry, there are no images matching your ${search_query}. Please try again.`,
        notifyInit
      );
      return;
    }

    const markup = createMarkup(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    pixabay.setTotal(total);
    Notify.success(`Hooray! We found ${total} images.`, notifyInit);

    if (pixabay.hasMorePhotos) {
      const lastItem = document.querySelector('.gallery a:last-child');
      observer.observe(lastItem);
    }

    modalLightBoxGallery.refresh();
  } catch (error) {
    Notify.failure(error.message, 'Something going wrong!', notifyInit);
    clearPage();
  } finally {
    spinnerStop();
  }
};

const onLoadMore = async () => {
  pixabay.incrementPage();

  if (!pixabay.hasMorePhotos) {
    refs.btnLoadMore.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
    notifyInit;
  }
  try {
    const { hits } = await pixabay.getPhotos();
    const markup = createMarkup(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    modalLightBoxGallery.refresh();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!', notifyInit);
    clearPage();
  }
};

function clearPage() {
  pixabay.resetPage();
  refs.gallery.insertAdjacentHTML = '';
  refs.btnLoadMore.classList.add('is-hidden');
}

refs.form.addEventListener('submit', onSubmitClick);
refs.btnLoadMore.addEventListener('click', onLoadMore);

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.photo-gallety')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function scrollFunction() {
  if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
    refs.btnUpWrapper.style.display = 'flex';
  }
}
