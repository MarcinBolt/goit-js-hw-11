import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
// import InfiniteScroll from 'react-infinite-scroller';
// import React, { useState, useEffect } from 'react';

const formDOM = document.querySelector('.search-form');
const inputDOM = document.querySelector('input[name="searchQuery"]');
const buttonLoadMoreDOM = document.querySelector('button.load-more');
const galleryDOM = document.querySelector('div.gallery');
let page = 1;
const perPages = 40;

function handleSubmit(e) {
  e.preventDefault();

  let searchingPhrasesTrimmed = inputDOM.value.trim();

  galleryDOM.textContent = '';
  if (!buttonLoadMoreDOM.classList.contains('is-hidden')) {
    buttonLoadMoreDOM.classList.add('is-hidden');
  }

  if (!searchingPhrasesTrimmed) {
    return;
  }
  page = 1;
  getImage(searchingPhrasesTrimmed);
}

function handleClick(e) {
  e.preventDefault();
  let searchingPhrasesTrimmed = inputDOM.value.trim();
  getImage(searchingPhrasesTrimmed);
}

const notifyAboutHowManyMatchesFound = totalHits =>
  Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);

const notifyAboutNoMatching = () => {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

async function getImage(searchingPhrases) {
  try {
    const searchParams = new URLSearchParams({
      key: '34547606-bcadd44fa8c62bb8814ebb3cc',
      q: `${searchingPhrases}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: `${perPages}`,
      page: `${page}`,
    });
    const response = await axios.get(
      `https://pixabay.com/api/?${searchParams}`
      // `https://pixabay.com/api/?key=34547606-bcadd44fa8c62bb8814ebb3cc&q=${searchingPhrases}&image_type=photo&orientation="horizontal"&safesearch="trur"&per_page=40`
    );
    const totalHits = response.data.totalHits;
    if (totalHits === 0) {
      notifyAboutNoMatching();
      return;
    }
    renderFilteredMatchingImages(response.data.hits);
    if (page === 1) {
      notifyAboutHowManyMatchesFound(totalHits);
    }
    if (totalHits / perPages >= page) {
      if (buttonLoadMoreDOM.classList.contains('is-hidden')) {
        buttonLoadMoreDOM.classList.remove('is-hidden');
      }
      page += 1;
    } else {
      buttonLoadMoreDOM.classList.add('is-hidden');
    }
  } catch (error) {
    console.error(error);
    notifyAboutNoMatching();
  }
}

function renderFilteredMatchingImages(images) {
  const markup = images
    .map(image => {
      return `<a href="${image.largeImageURL}"><div class="photo-card">
  <img class="photo-card__img" src="${image.webformatURL}" alt="${image.tags}" width="375px" height="200px" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${image.likes}
    </p>
    <p class="info-item">
      <b>Views</b>${image.views}
    </p>
    <p class="info-item">
      <b>Comments</b>${image.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${image.downloads}
    </p>
  </div>
</div></a>`;
    })
    .join('');
  galleryDOM.insertAdjacentHTML('beforeend', markup);

  if (page > 1) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }

  let lightbox = new SimpleLightbox('.gallery a', {
    /* options */
    captionsData: 'alt',
    captionPosition: 'outside',
    captionDelay: 100,
  });
}

formDOM.addEventListener('submit', handleSubmit);
buttonLoadMoreDOM.addEventListener('click', handleClick);
