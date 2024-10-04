"use strict";

// og slideshow solution, using functions with access to outerscope variables

// $(() => {
//   const templates = {};

//   document.querySelectorAll("script[type='text/x-handlebars']").forEach(tmpl => {
//     templates[tmpl["id"]] = Handlebars.compile(tmpl["innerHTML"]);
//   });

//   document.querySelectorAll("[data-type=partial]").forEach(tmpl => {
//     Handlebars.registerPartial(tmpl["id"], tmpl["innerHTML"]);
//   });

//   function renderPhotos() {
//     let slides = document.getElementById('slides');
//     slides.innerHTML = (templates.photos({ photos: photos }));
//   }

//   function getPhotoByID(photoID) {
//     return photos.filter((item) => {
//       return item.id === photoID;
//     })[0];
//   }

//   function renderPhotoInformation(photoID) {
//     let photo = getPhotoByID(photoID);
//     let header = document.querySelector("section > header");
//     header.innerHTML = (templates.photo_information(photo));
//   }

//   function renderCommentsFor(photoID) {
//     fetch("/comments?photo_id=" + photoID)
//       .then(response => response.json())
//       .then(comments => {
//         let commentList = document.querySelector("#comments ul");
//         commentList.innerHTML = (templates.photo_comments({ comments: comments }));
//     });
//   }

//   function updateToNextPhoto() {
//     $(`figure[data-id=${currentPhoto.id}]`).fadeOut();
//     photoIndex += 1;
//     if (photoIndex >= photos.length) {
//       photoIndex = 0;
//     }
//     currentPhoto = photos[photoIndex];
//     $(`figure[data-id=${currentPhoto.id}]`).fadeIn();
//   }

//   function updateToPrevPhoto() { 
//     $(`figure[data-id=${currentPhoto.id}]`).fadeOut();
//     photoIndex -= 1;
//     if (photoIndex < 0) {
//       photoIndex = photos.length - 1;
//     }
//     currentPhoto = photos[photoIndex];
//     $(`figure[data-id=${currentPhoto.id}]`).fadeIn();
//   }

//   let photos;
//   let currentPhoto;
//   let photoIndex;

//   fetch("/photos")
//     .then(response => response.json())
//     .then(data => {
//       photos = data;
//       photoIndex = 0;
//       currentPhoto = photos[photoIndex];
//       renderPhotos();
//       renderPhotoInformation(currentPhoto.id);
//       renderCommentsFor(currentPhoto.id);

//       $('.next').on('click', event => {
//         event.preventDefault();
//         updateToNextPhoto();
//         renderPhotoInformation(currentPhoto.id);
//         renderCommentsFor(currentPhoto.id);
//       });
    
//       $('.prev').on('click', event => {
//         event.preventDefault();
//         updateToPrevPhoto();
//         renderPhotoInformation(currentPhoto.id);
//         renderCommentsFor(currentPhoto.id);
//       });
//   });
// });


// new version of solution with a class to encapsulate slideshow functions
// also avoids use of global scope variables

$(() => {
  const templates = {};

  document.querySelectorAll("script[type='text/x-handlebars']").forEach(tmpl => {
    templates[tmpl["id"]] = Handlebars.compile(tmpl["innerHTML"]);
  });

  document.querySelectorAll("[data-type=partial]").forEach(tmpl => {
    Handlebars.registerPartial(tmpl["id"], tmpl["innerHTML"]);
  });

  class Slideshow {
    constructor(photosData) {
      this.photos = photosData;
      this.currentPhoto = this.photos[0];
      this.photoIndex = 0;
      this.$newCommentForm = $('form');

      this.#renderPhotos();
      this.#renderPhotoInformation(this.photos[0].id);
      this.#renderCommentsFor(this.photos[0].id);

      $('.prev').on('click', event => {
        event.preventDefault();
        this.#prevSlide();
        this.#renderPhotoInformation(this.currentPhoto.id);
        this.#renderCommentsFor(this.currentPhoto.id);
        this.$newCommentForm.find('input[name=photo_id]').val(this.currentPhoto.id);
      });

      $('.next').on('click', event => {
        event.preventDefault();
        this.#nextSlide();
        this.#renderPhotoInformation(this.currentPhoto.id);
        this.#renderCommentsFor(this.currentPhoto.id);
        this.$newCommentForm.find('input[name=photo_id]').val(this.currentPhoto.id);
      });

      $('section > header').on('click', (event) => {
        event.preventDefault();
        if (event.target.className === ('button like')) {
          this.#likePhoto();
        } else if (event.target.className === ('button favorite')) {
          this.#favoritePhoto();
        }
      });

      this.$newCommentForm.on('submit', event => {
        event.preventDefault();
        let serializedFormData = this.$newCommentForm.serialize();
        console.log(serializedFormData);
        this.#addComment(serializedFormData);
        event.currentTarget.reset();
      })
    }

    #renderPhotos() {
      let slides = document.getElementById('slides');
      slides.innerHTML = (templates.photos({ photos: this.photos }));
    }

    #getPhotoByID(photoID) {
      return this.photos.filter((item) => {
        return item.id === photoID;
      })[0];
    }

    #renderPhotoInformation(photoID) {
      let photo = this.#getPhotoByID(photoID);
      let header = document.querySelector("section > header");
      header.innerHTML = (templates.photo_information(photo));
    }
  
    #renderCommentsFor(photoID) {
      fetch("/comments?photo_id=" + photoID)
        .then(response => response.json())
        .then(comments => {
          let commentList = document.querySelector("#comments ul");
          commentList.innerHTML = (templates.photo_comments({ comments: comments }));
      });
    }

    #prevSlide() {
      $(`figure[data-id=${this.currentPhoto.id}]`).fadeOut();
      this.photoIndex -= 1;
      if (this.photoIndex < 0) {
        this.photoIndex = this.photos.length - 1;
      }
      this.currentPhoto = this.photos[this.photoIndex];
      $(`figure[data-id=${this.currentPhoto.id}]`).fadeIn();
    }

    #nextSlide() {
      $(`figure[data-id=${this.currentPhoto.id}]`).fadeOut();
      this.photoIndex += 1;
      if (this.photoIndex >= this.photos.length) {
        this.photoIndex = 0;
      }
      this.currentPhoto = this.photos[this.photoIndex];
      $(`figure[data-id=${this.currentPhoto.id}]`).fadeIn();
    }

    #likePhoto() {
      fetch('/photos/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `photo_id=${this.currentPhoto.id}`,})
      .then(response => response.json())
      .then(data => {
        this.currentPhoto.likes = data.total;
        this.#renderPhotoInformation(this.currentPhoto.id);
      });
    }

    #favoritePhoto() {
      fetch('/photos/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `photo_id=${this.currentPhoto.id}`,
      }).then(response => response.json())
        .then(data => {
          this.currentPhoto.favorites = data.total;
          this.#renderPhotoInformation(this.currentPhoto.id);
      });
    }

    #addComment(serializedFormData) {
      fetch('/comments/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: serializedFormData,
      }).then(response => response.json())
        .then(commentData => {
          $('#comments ul').append(templates.photo_comment(commentData));
      });
    }
  }

  fetch("/photos")
    .then(response => response.json())
    .then(photosData => {
      const slideShow = new Slideshow(photosData);
  });
});
