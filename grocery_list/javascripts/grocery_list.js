"use strict";

/*

Problems:
  1. get the basic form to work as intended:
    Add an event handler for the submit event on the form.
    Retrieve the item name and value from the form elements.
    Use a quantity of 1 if the quantity field is left empty.
    Create a new list item object using the name and quantity as strings.
    Add the list item to the grocery list portion of the HTML.
    Clear the form's contents.
  2. display only the list when entering print preview

*/

$(() => {
  let form = $('form').eq(0);

  form.on('submit', (event) => {
    event.preventDefault();

    let name = $('#name').val();
    let quantity = Number($('#quantity').val()) || '1';

    let newItemElement = document.createElement('li');
    $('#grocery-list').append(newItemElement);

    newItemElement.textContent = `${quantity} ${name}`;

    event.currentTarget.reset();
  });

  $(window).on('beforeprint', (event) => form.toggle())
    .on('afterprint', (event) => form.toggle());
});

