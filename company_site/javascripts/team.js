"use strict";

/*

Problem:
  create modal that pops up whenever any team member is clicked
    -content set dynamically
    -includes close link using the image of an X in top right
    -uses provided CSS to be centered on page
    -also closes if you click anywhere outside it (on an overlay)
    -have it fade in and out when opening/closing using jQuery animation effects
    -also add an event listener to close modal if escape key is pressed ('keyup')?
  modal appearance:
    -close link image in top right
    -team member image then name on same line
    -paragraph of lorem ipsum text below
    -add to css to arrange elements properly within modal
    -opaque white background
    -name is blue text

Notes:
  -css added to site.css file for `modal` id
  -this fits well with my intention to dynamically set content of a single modal
  -recommended to use HTML Data Attributes to solve problem?
  -seems like a good time to use handlebars as well
  -creating modal markup myself, may also need to modify existing markup
    (e.g. to create matching data attributes)

*/


$(() => {
  let $modal = $('#modal');
  let $teammates = $('#team a');
  let $modalLayers = $('.modal-layers');

  let templateFunction = Handlebars.compile($('#modal-script').html());
  
  $teammates.on('click', (event) => {
    event.preventDefault();

    let targetImage = event.currentTarget.querySelector('img');

    let teammateInfo = {
      teammateName: targetImage.getAttribute('alt'),
      teammateImg: targetImage.getAttribute('src'),
    };

    $modal.html(templateFunction(teammateInfo))

    $modal.css({
      top: $(window).scrollTop() + 30
    });

    $modalLayers.fadeToggle('slow');

    $('.close').on('click', (event) => {
      event.preventDefault();

      $modalLayers.fadeToggle('slow');
    });
  });

  $(document).on('keyup', (event) => {
    if (event.key === 'Escape' && $modal.css('display') !== 'none') {
      $modalLayers.fadeToggle('slow');
    }
  });

  $('#overlay').on('click', (event) => {
    $modalLayers.fadeToggle('slow');
  });
});