"use strict";

// old solution before refactoring, not referenced by booking_time_slots.html

document.addEventListener('DOMContentLoaded', () => {
  const rootURL = 'http://localhost:3000';

  // populate the select options for schedules

  let scheduleSelector = document.querySelector('#schedule_selector');

  let getSchedulesXHR = new XMLHttpRequest();
  getSchedulesXHR.open('GET', `${rootURL}/api/schedules`);
  getSchedulesXHR.responseType = 'json';

  getSchedulesXHR.addEventListener('load', () => {
    let allSchedules = getSchedulesXHR.response;
    let availableSchedules = allSchedules.filter(schedule => !schedule.student_email);

    let getStaffXHR = new XMLHttpRequest();
    getStaffXHR.open('GET', `${rootURL}/api/staff_members`);
    getStaffXHR.responseType = 'json';

    getStaffXHR.addEventListener('load', () => {
      let allStaff = getStaffXHR.response;
      availableSchedules.forEach(schedule => {
        let option = document.createElement('option');
        let staffID = schedule.staff_id;
        let staffName = allStaff.find(staffMember => staffMember.id === staffID).name;
        option.textContent = `${staffName} | ${schedule.date} | ${schedule.time}`;
        option.value = schedule.id;
        scheduleSelector.appendChild(option);
      });  
    });

    getStaffXHR.send();
  });

  getSchedulesXHR.send();

  // handle the booking form submission

  let bookingForm = document.querySelector('#booking_form');
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    let bookScheduleXHR = new XMLHttpRequest();
    bookScheduleXHR.open('POST', `${rootURL}/api/bookings`);
    bookScheduleXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

    let bookingData = {
      id: scheduleSelector.value,
      student_email: document.querySelector('#student_email').value,
    };

    let divBlock = document.querySelector('#add_student_hidden_block');
    let newEmailInput = divBlock.querySelector('#email');
    let oldEmailInput = document.querySelector('#student_email');
    let bookingSequenceInput = divBlock.querySelector('#booking_sequence');

    bookScheduleXHR.addEventListener('load', () => {
      if (bookScheduleXHR.status === 204) {
        alert('Booked');
      } else if (bookScheduleXHR.status === 404) {
        let message = bookScheduleXHR.responseText;
        alert(message);
        let bookingSequence = Number(message.split('booking_sequence: ')[1]);
        if (bookingSequence) { // if found, then...
          // reveal new form and populate with data from initial request
          divBlock.removeAttribute('hidden');

          newEmailInput.value = oldEmailInput.value;
          bookingSequenceInput.value = bookingSequence;
        }
      }
    });

    bookScheduleXHR.send(JSON.stringify(bookingData));

    // handle the submission of the 2nd form to add a new student, if needed

    let addStudentForm = document.querySelector('#add_student_form');
    addStudentForm.addEventListener('submit', event => {
      event.preventDefault();

      let addStudentXHR = new XMLHttpRequest();
      addStudentXHR.open('POST', `${rootURL}/api/students`);
      addStudentXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      addStudentXHR.addEventListener('load', () => {
        alert(addStudentXHR.responseText);

        let rebookScheduleXHR = new XMLHttpRequest();
        rebookScheduleXHR.open('POST', `${rootURL}/api/bookings`);
        rebookScheduleXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        rebookScheduleXHR.addEventListener('load', () => {
          if (rebookScheduleXHR.status === 204) {
            alert('Booked');
          } else {
            alert(rebookScheduleXHR.textContent);
          }
        });

        rebookScheduleXHR.send(JSON.stringify(bookingData));
      });

      let studentData = {
        email: newEmailInput.value,
        name: document.querySelector('#name').value,
        booking_sequence: bookingSequenceInput.value,
      };

      addStudentXHR.send(JSON.stringify(studentData));
    });
  });
});
