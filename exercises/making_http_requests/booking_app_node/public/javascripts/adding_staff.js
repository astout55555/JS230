"use strict";

/*

Problem:
  1. create an html form to add new staff to DB using the booking app API
    -form should have roughly similar CSS style as example
    -handle empty/incomplete form entries
      alert error message (body of response)
  2. add staff to DB and display data of new staff member id using response data
    -after success, alert user of successful entry and display new staff member id
    -format: `Successfully created staff with id: ${id}`

[HTML/CSS, already finished. still need to implement JS to handle submissions.]
[-for that, I had to remember to use same field names as the api docs indicated]

Data:
  -should work with XHR to interact with database and avoid routing complications
    (I don't have full understanding of how the routing works on pre-provided project)
  -will pull textContent of email and name form fields when submit button pressed
  -will therefore also need to listen for form submission
  -send form as instance of FormData to keep simple

Algorithm:
  Inside eventListener for 'DOMContentLoaded'...

Algorithm for #1 & #2:
0. select form with queryselector
1. add listener to form for submit event
2. send this data via an XHR with 'POST' using '/api/staff_members' route
3. if status is 4xx, alert user using body of error message response
4. if status is 201, interpolate response data from {id: staff_id} in string message alert

*/

document.addEventListener('DOMContentLoaded', () => {
  let form = document.querySelector('#add_staff_form');

  form.addEventListener('submit', event => {
    event.preventDefault();
  
    let data = new FormData(form);
  
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/api/staff_members');
    // xhr.responseType = 'json'; // don't set here or 400 error won't work
  
    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        let responseData = JSON.parse(xhr.response); // parse JSON response
        alert(`Successfully created staff with id: ${responseData.id}`);
      } else if (xhr.status === 400) {
        // alert('Staff cannot be created. Check your inputs.'); // manual message
        alert(xhr.responseText); // message accessible since not expecting JSON
      }
    });
  
    xhr.send(data);
  });  
});
