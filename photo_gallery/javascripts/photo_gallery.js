"use strict";

/*

Problem:
  -use an "active" class to designate the selected / currently visible image
  -clicks on other thumbnails should remove that class, add it to clicked image
  -class should both cause the main image to match thumbnail, and highlight thumbnail
  -extra: use fade animations for fading in and out

*/

document.addEventListener('DOMContentLoaded', () => {
  let mainImage = document.getElementById('main-image');

  let thumbnails = document.querySelectorAll('ul img');
  thumbnails.forEach((thumbnail, _, thumbnails) => {
    thumbnail.addEventListener('click', () => {
      thumbnails.forEach(thumbnail => thumbnail.classList.remove('active'));

      thumbnail.classList.toggle('active');
      mainImage.src = thumbnail.src;
      mainImage.alt = thumbnail.alt;
    });
  });
});
