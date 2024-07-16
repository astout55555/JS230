"use strict";

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

function deleteSchedule(scheduleID) {
  let deleteXHR = new XMLHttpRequest();
  deleteXHR.open('DELETE', `http://localhost:3000/api/schedules/${scheduleID}`);
  deleteXHR.addEventListener('load', () => {
    if (deleteXHR.status === 204) {
      alert('Schedule deleted.');
    } else {
      alert(`${deleteXHR.responseText}`);
    }   
    });
  deleteXHR.send();
}

async function deleteAndRefreshForm(form, scheduleID) {
  try {
    await deleteSchedule(scheduleID);
    let cancelledOption = document.querySelector(`#schedule-${scheduleID}`);
    cancelledOption.remove();
    form.reset();
  } catch (error) {
    console.log(error);
  }
}

function cancelBooking(bookingID) {
  let cancelXHR = new XMLHttpRequest();
  cancelXHR.open('PUT', `http://localhost:3000/api/bookings/${bookingID}`);
  cancelXHR.addEventListener('load', () => {
    if (cancelXHR.status === 204) {
      alert('Booking cancelled.');
    } else {
      alert(`${cancelXHR.responseText}`);
    }
  });
  cancelXHR.send();
}

async function cancelAndRefreshForm(form, bookingID) {
  try {
    await cancelBooking(bookingID);
    let cancelledOption = document.querySelector(`#booking-${bookingID}`);
    cancelledOption.remove();
    form.reset();
  } catch (error) {
    console.log(error);
  }
}

async function populateUnbookedSchedules(scheduleSelector, rootURL) {
  try {
    let allSchedules = await getJSON(`${rootURL}/api/schedules`);
    let allStaff = await getJSON(`${rootURL}/api/staff_members`);
    let availableSchedules = allSchedules.filter(schedule => !schedule.student_email);
  
    availableSchedules.forEach(schedule => {
      let option = document.createElement('option');
      let staffID = schedule.staff_id;
      let staffName = allStaff.find(staffMember => staffMember.id === staffID).name;
      option.textContent = `${staffName} | ${schedule.date} | ${schedule.time}`;
      option.value = schedule.id;
      option.id = `schedule-${schedule.id}`;
      scheduleSelector.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function populateBookings(bookingSelector, rootURL) {
  try {
    let allSchedules = await getJSON(`${rootURL}/api/schedules`);
    let allStaff = await getJSON(`${rootURL}/api/staff_members`);
    let bookedSchedules = allSchedules.filter(schedule => schedule.student_email);
  
    bookedSchedules.forEach(booking => {
      let option = document.createElement('option');
      let staffID = booking.staff_id;
      let staffName = allStaff.find(staffMember => staffMember.id === staffID).name;
      option.textContent = `${staffName} | ${booking.date} | ${booking.time}`;
      option.value = booking.id;
      option.id = `booking-${booking.id}`;
      bookingSelector.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const rootURL = 'http://localhost:3000';

  let scheduleSelector = document.querySelector('#schedule-selector');
  populateUnbookedSchedules(scheduleSelector, rootURL);

  let bookingSelector = document.querySelector('#booking-selector');
  populateBookings(bookingSelector, rootURL);

  let scheduleDeleteForm = document.querySelector('#schedule-delete-form');
  scheduleDeleteForm.addEventListener('submit', event => {
    event.preventDefault();

    let scheduleID = document.querySelector('#schedule-selector').value;
    deleteAndRefreshForm(scheduleDeleteForm, scheduleID);
  });

  let bookingCancellationForm = document.querySelector('#booking-cancellation-form');
  bookingCancellationForm.addEventListener('submit', event => {
    event.preventDefault();

    let bookingID = document.querySelector('#booking-selector').value;
    cancelAndRefreshForm(bookingCancellationForm, bookingID);
  });
});
