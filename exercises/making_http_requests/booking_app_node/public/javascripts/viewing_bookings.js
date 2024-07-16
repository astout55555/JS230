"use strict";

/*

Problem: 
1. generate a two-tiered list
  -1st tier: dates with one or more bookings
    -2nd tier: each booking details ('staffName | studentEmail | time')
2. can get booked dates using GET `/api/bookings`, returns array of date strings
3. can get booking details for specific date with GET `/api/bookings/:date`
4. 1st tier visible at first, which responds to user click by revealing/populating 2nd tier

Algorithm:
0. use function to get/parse JSON data
0.5. start with hardcoded html <ul> element (empty)
1. first, get all booked dates, store array
2. for each booked date, create <li> element with dateString as textContent
  3. add event listener for 'click' to each, which
    4. populates a new <ul>, and fills it with each booking's details
      -(GET `/api/bookings/:date`), returns array
      5. iterate through array, and for each:
        6. create <li> and insert into the current (sub) <ul>

*/

function getJSON(path) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${path}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(Error(`Status ${xhr.status}: ${xhr.statusText}`));
      }
    });
    xhr.send();
  });
}

async function populateBookingDates(bookingDateList) {
  let bookedDates = await getJSON('/api/bookings');

  bookedDates.forEach(dateString => {
    let dateListItem = document.createElement('li');
    bookingDateList.appendChild(dateListItem);
    dateListItem.textContent = dateString;

    dateListItem.addEventListener('click', () => {
      populateBookingTimes(dateListItem);
    });
  });
}

async function populateBookingTimes(bookingDateItem) {
  let date = bookingDateItem.textContent;
  let bookingTimes = await getJSON(`/api/bookings/${date}`);

  let bookingsList = document.createElement('ul');
  bookingDateItem.appendChild(bookingsList);

  bookingTimes.forEach(booking => {
    let bookingItem = document.createElement('li');
    bookingsList.appendChild(bookingItem);
    bookingItem.textContent = booking.join(' | ');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const rootURL = 'http://localhost:3000';

  let bookingDateList = document.querySelector('#booking-date-list');

  populateBookingDates(bookingDateList);
});
