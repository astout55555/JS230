"use strict";

/*

Problem:

retrieve all schedules that are available
  -if any available, tally count of schedules for each staff
    -alert user of the result as key/value pairs
      (with staff id as key and count of schedules as value)
  -if none available, alert user that none are avaialble for booking
  -if delay of 5+ seconds occurs when retrieving data, cancel and alert user
    (note: slow down generally occurs if 7+ schedules retrieved at once)

Data:
  -use an XHR to retrieve needed info
  -manipulate the data in JS once schedule data retrieved
  -run program on same origin page to avoid CORS errors (from browser)
  -parsed JSON data is an array with 9 schedule objects
    -scheduleObject = {
      id: number
      staff_id: number
      student_email: email string // if booked, else `null`
      date: 00-00-00 formatted date string
    }

Algorithm:
1. create new XMLHttpRequest
2. open it with GET method and url for the '/api/schedules' path to get data
3. set `request.responseType` to 'json' to parse the response as JSON data
4. add load event handler to handle response
  [add details later, manipulate data to decide what to display to user]
5. within some sort of timing function, send XHR and...
  -cancel it after 5 seconds
  -alert user if cancelled

Algorithm for step 5:

1. `request.timeout = 5000;` // set timeout limit for request
2. create event listener for `timeout` event, which alerts user
3. `request.send()`

Algorithm for step 4:

1. init resultsArray equal to selection of scheduleObjects from response array
  -select based on if they have data for schedule.student_email
2. if size of resultsArray === responseArray.length, alert user all are booked
3. ^guard clause--if not triggered, process data further for a report to user
4. declare/init empty results object
5. iterate over array
  for each staff id, if results object does not include it, set its value to 1
    if it does, results[staffID] += 1
6. iterate over results object, converting to array of `staff {id}: {count}` strings
7. join strings into a single string with \n breaks, alert user of this string result

*/

function getAvailableSchedules() {
  let xhr = new XMLHttpRequest();
  
  xhr.open('GET', 'http://localhost:3000/api/schedules');
  
  xhr.responseType = 'json';
  
  xhr.timeout = 5000;
  
  xhr.addEventListener('load', () => {
    alert('Loaded successfully!');
    let allSchedules = xhr.response;

    let availableSchedules = allSchedules.filter(schedule => !schedule.student_email);
    if (availableSchedules.length === 0) {
      alert('Sorry, all schedules are booked!');
    } else {
      displayAvailableSchedulesByStaff(availableSchedules);
    }
  });
  
  xhr.addEventListener('timeout', () => {
    alert('Request took too long! Please try again.')
  });
  
  xhr.send();
}

function displayAvailableSchedulesByStaff(arrayOfAvailableSchedules) {
  let results = {};
  arrayOfAvailableSchedules.forEach(schedule => {
    if (results[`staff ${schedule.staff_id}`]) {
      results[`staff ${schedule.staff_id}`] += 1;
    } else {
      results[`staff ${schedule.staff_id}`] = 1;
    }
  });

  let resultPairStrings = Object.entries(results).map(([key, value]) => `${key}: ${value}`);

  let formattedResult = resultPairStrings.join(`\n`);

  alert(formattedResult);
}

getAvailableSchedules();

// Further Exploration:
// use '/schedules/:staff_id' route rather than iteratively counting each staff's schedule.
// slower (requires more XHRs), but good practice for working with XHRs.
// too complicated for me on a first pass, return later?
