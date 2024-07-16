"use strict";

/*

Problem Summaries:
  1. create html for adjustable form to add 1 or more schedules to DB at once
  2. use CSS styling to make it look roughly similar to the example
  3. implement JS to make request to DB and alert user of the outcome using response data

Elaboration of problem and initial data/algorithm considerations:

1. HTML
-one or more fieldsets with legend titles and labels/inputs
  -use dropdown input for the staff names
    -need to find a way to populate it with all staff names from the DB
-must be adjustable--include an "Add more schedules" button to add another fieldset etc.
  -keep track of number of fieldsets, "scedule X" where X is next number
-submit button which submits all data from all fields at once (single form)

2. CSS
-blue "add more schedules" buton with white text
-labels for inputs use red text
-red submit button with white text

3. JS
-for "add more schedules"
  -in response to click event, create additional DOM elements for another full fieldset
    -have a counter for the next fieldset number to display
    -can use `cloneNode()` method with `deep` param set to `true` for deep copies
      -will still need to manipulate returned copy to use updated number
      -then, append as next element sibling in the form
-for the select element in the fieldsets
  -need to retrieve all the names of the staff and add each to an option element
  -these names/options need to be duplicated with every fieldset created
-for "submit"
  -POST request to '/api/schedules', must include the following fields:
    -staff_id (number) - must find based on value of the Staff Name input
      -must make additional GET request to /api/staff_members, then filter by name value
    -date (string) - the value of the input
    -time (string) - the value of the input
  -send form to DB using FormData instance, then react based on status code of response
    -for 201 (success) or 400 (failure): responseText is success message

Algorithms:

For populating the staff names as option elements within select element(s):
  -only need to do this once--copies will be made for additional form sections
1. within the 'DOMContentLoaded' event listener...
  -declare new XHR
  -'GET' method, using '${SCHEME & HOST}/api/staff_members'
  -set response type to 'json'
  -send()
  -(xhr.response will be parsed as array of staff objects)
    -store staff objects for future use with let (avoid repeat requests)
  2. select the <select> element within the 1st form section
  3. iterate through xhr.response, and for each:
    -create new html option element with value of staffObject.name
      -create as child of <select> element
      -

Creating a new section of the form for an additional schedule:
1. within the 'DOMContentLoaded' event listener...
  -declare/init a schedule form section counter at 1
  2. add 'submit' event listener to the add more schedules form
    -prevent default
    -create deep copy of the last child of schedule adding form
      -store with let
    -counter += 1
    -walk through each element of the copy
      -for each replace the previous number with the new number
        -(for name and id attributes)
        -(also update input if it is the legend element)
    -append this updated copy as the 2nd to last element child of the schedule adding form
      (before the submit button)

Walking through to update each element of a section copy:
1. utilize recursive walk function to select each node in turn
2. update each textContent and `name`, `for`, and `id` attributes as needed
  -if the last character of its string value === totalCount - 1.toString
  -replace this character with ${totalCount}

Serialize and submit one or more new staff schedules:
1. within the 'DOMContentLoaded' event listener...
  -(staff objects should be stored from previous xhr.response)
  2. add 'submit' event listener for the schedule submission form
    -prevent default
    -declare new XHR, 'POST', '/api/schedules'
    3. declare dataToSend object to fill with data
      -include `'schedules': []` starting key/value
    4. for each schedule submitted, serialize data into JSON string and push to array
      -(user must submit all schedule adding form sections)
      -(i.e. iterate through each form section except the last one (the submit button)
      -to serialize, for each section:
        -get the selected value of the staff name input
        -select the staff object from prior xhr.response with the same name
        -get the id value of that staff object
        -create object to insert into the schedules array within dataToSend object:
          -(will have 'staff_id', 'date', and 'time' keys)
          -'staff_id' = the id value identified above
            -e.g. `convertedStaffObject.staff_id = staffObject.id`
          -date and time are just the date and time input values
            -e.g. `convertedStaffObject.date = staffObject.date`
        -then, JSON.stringify(convertedStaffObject)
        -then, dataToSend.push(jsonStringOfStaffObject)
    5. send(allJSONStringData)

React to response and display response message to user based on status:
1. Within 'DOMContentLoaded', and within the 'submit' event listener for main form...
  -(after sending the data for the XHR response...)
  -alert user with responseText message

*/

const urlRoot = 'http://localhost:3000';

function walkAndUpdate(element, newCount) {
  updateAllNumbering(element, newCount);

  for (let index = 0; index < element.children.length; index += 1) {
    walkAndUpdate(element.children[index], newCount);
  }
}

function updateAllNumbering(currentElement, newCount) {
  if (currentElement.tagName === 'LEGEND') {
    currentElement.textContent = getUpdatedValue(currentElement.textContent, newCount);
  }

  let name = currentElement.name;
  if (name) {
    currentElement.name = getUpdatedValue(name, newCount);
  }

  let id = currentElement.id;
  if (id) {
    currentElement.id = getUpdatedValue(id, newCount);
  }

  let forValue = currentElement.getAttribute('for');
  if (forValue) {
    currentElement.setAttribute('for', getUpdatedValue(forValue, newCount));
  }
}

function getUpdatedValue(textValue, newCount) {
  let oldCountChar = (newCount - 1).toString();
  let newCountChar = newCount.toString();

  if (textValue.endsWith(oldCountChar)) {
    textValue = textValue.slice(0, [textValue.length - 1]) + newCountChar;
  }

  return textValue;
}

document.addEventListener('DOMContentLoaded', () => {
  let getStaffXHR = new XMLHttpRequest();
  getStaffXHR.open('GET', `${urlRoot}/api/staff_members`);
  getStaffXHR.responseType = 'json';
  getStaffXHR.send();

  getStaffXHR.addEventListener('load', () => {
    let staff = getStaffXHR.response;

    let staffNamesDropdown = document.querySelector('select');
  
    staff.forEach(staffObject => {
      let option = document.createElement('OPTION');
      staffNamesDropdown.appendChild(option);
      option.textContent = staffObject.name;
      option.setAttribute('name', staffObject.name);
    });
  });

  let formSectionsCount = 1;

  let formExpander = document.querySelector('#schedule_form_maker');
  let scheduleAdderForm = document.querySelector('#add_staff_schedules_to_db');

  formExpander.addEventListener('submit', event => {
    event.preventDefault();

    let lastSection = scheduleAdderForm.lastElementChild.previousElementSibling;
    let lastSectionCopy = lastSection.cloneNode(true); // deep copy
    lastSection.insertAdjacentElement('afterend', lastSectionCopy);

    formSectionsCount += 1;
    walkAndUpdate(lastSectionCopy, formSectionsCount);
  });

  scheduleAdderForm.addEventListener('submit', event => {
    event.preventDefault();

    let addSchedulesXHR = new XMLHttpRequest();
    addSchedulesXHR.open('POST', `${urlRoot}/api/schedules`);
    addSchedulesXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

    let dataToSend = {schedules: []};

    let formSections = document.querySelectorAll('fieldset');
    let formSectionsArray = [].slice.call(formSections);
    
    formSectionsArray.forEach((fieldset, index) => {
      let requestData = {};

      let nameSelector = fieldset.querySelector(`#staff_name_${index + 1}`);
      let namedStaff = getStaffXHR.response.find(staffObject => {
        return staffObject.name === nameSelector.value;
      });

      requestData.staff_id = namedStaff.id;

      let dateInput = fieldset.querySelector(`#date_${index + 1}`);
      requestData.date = dateInput.value;

      let timeInput = fieldset.querySelector(`#time_${index + 1}`);
      requestData.time = timeInput.value;

      dataToSend.schedules.push(requestData);
    });

    addSchedulesXHR.addEventListener('load', () => {
      alert(`${addSchedulesXHR.responseText}`);
    });

    addSchedulesXHR.send(JSON.stringify(dataToSend));
  });
});
