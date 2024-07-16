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

// if working with async functions
async function populateScheduleOptions(scheduleSelector, rootURL) {
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
      scheduleSelector.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const rootURL = 'http://localhost:3000';

  let scheduleSelector = document.querySelector('#schedule_selector');

  populateScheduleOptions(scheduleSelector, rootURL); // invoke async function here

  // // or, if working directly with promises:
  // let getSchedules = getJSON(`${rootURL}/api/schedules`);
  // let getStaff = getJSON(`${rootURL}/api/staff_members`);

  // Promise.all([getSchedules, getStaff]).then(([allSchedules, allStaff]) => {
  //   let availableSchedules = allSchedules.filter(schedule => !schedule.student_email);

  //   availableSchedules.forEach(schedule => {
  //     let option = document.createElement('option');
  //     let staffID = schedule.staff_id;
  //     let staffName = allStaff.find(staffMember => staffMember.id === staffID).name;
  //     option.textContent = `${staffName} | ${schedule.date} | ${schedule.time}`;
  //     option.value = schedule.id;
  //     scheduleSelector.appendChild(option);
  //   });
  // }).catch(firstError => alert(firstError));

  // // handle the booking form submission
  let divBlock = document.querySelector('#add_student_hidden_block');

  let bookingForm = document.querySelector('#booking_form');
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    let bookScheduleXHR = new XMLHttpRequest();
    bookScheduleXHR.open('POST', `${rootURL}/api/bookings`);

    let bookingData = new FormData(bookingForm);

    bookScheduleXHR.addEventListener('load', () => {
      if (bookScheduleXHR.status === 204) {
        alert('Booked');
        bookingForm.reset();
      } else if (bookScheduleXHR.status === 404) {
        let message = bookScheduleXHR.responseText;
        alert(message);
        let bookingSequence = message.split('booking_sequence: ')[1];
        if (bookingSequence) {
          // reveal new form and populate with data from initial request
          divBlock.hidden = false;
          divBlock.querySelector('#email').value = bookingData.get('student_email');
          divBlock.querySelector('#booking_sequence').value = bookingSequence;
        }
      }
    });

    bookScheduleXHR.send(bookingData);

    // // handle the submission of the 2nd form to add a new student, if needed
    let addStudentForm = document.querySelector('#add_student_form');
    addStudentForm.addEventListener('submit', event => {
      event.preventDefault();

      let addStudentXHR = new XMLHttpRequest();
      addStudentXHR.open('POST', `${rootURL}/api/students`);
      let studentData = new FormData(addStudentForm);

      addStudentXHR.addEventListener('load', () => {
        alert(addStudentXHR.responseText);

        if (addStudentXHR.status === 201) {
          addStudentForm.reset();
          divBlock.hidden = true;
          bookingForm.student_email.value = studentData.get('email'); // ensures match
          bookingForm.dispatchEvent(new Event('submit', { cancelable: true }));  
        }
      });

      addStudentXHR.send(studentData);
    });
  });
});
