"use strict";

/*

Problem:
1. take form input (first-number, second-number, and operator) and calculate result
2. display result by changing value of result h1 element

Data:

-input is received as strings (even though input type is `number`)
-operator (select element) value is a string
-selected elements are jQuery objects

Algorithm:

1. add event listener to form for 'submit' and prevent default
2. get values from number inputs and convert to numbers
2. use switch statement to calculate result based on operator
3. update text of result element to this value

*/

$(() => {
  let result = $('#result');

  $('form').on('submit', (event) => {
    event.preventDefault();

    let num1 = Number($('#first-number').val());
    let num2 = Number($('#second-number').val());
    let operator = $('#operator').val();
    switch (operator) {
      case '+':
        result.text(num1 + num2);
        break;
      case '-':
        result.text(num1 - num2);
        break;
      case '*':
        result.text(num1 * num2);
        break;
      case '/':
        result.text(num1 / num2);
        break;
    }
  });
});