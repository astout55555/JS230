"use strict";

$(() => {
  let $message = $("#message");
  let $letters = $("#spaces");
  let $guesses = $("#guesses");
  let $apples = $("#apples");
  let $replay = $("#replay");

  const randomWord = (() => {
    let words = ['apple', 'banana', 'orange', 'pear'];
  
    return function() {
      let word = words[Math.floor(Math.random() * words.length)];
      words.splice(words.indexOf(word), 1);
      return word;
    };
  })();
  
  class Game {
    constructor() {
      this.#prepGame();
      this.gameWord = randomWord();
      if (!this.gameWord) {
        this.#displayMessage("Sorry, I've run out of words!");
        return this;
      }
      this.#resetClasses();
      this.maxWrongGuesses = 6;
      this.wrongGuesses = 0;
      this.lettersGuessed = [];
      this.#resetBlanks();
    }

    #prepGame() {
      $replay.hide();
      $message.hide();

      let currentGame = this; // `this` in event handler is normally currentTarget,
      $(document).on('keydown', (event) => {
        if (event.key.match(/[a-z]/)) {
          currentGame.#guess(event.key); // so `this.guess()` works but isn't clear
        }
      });
    }

    #displayMessage(message) {
      $message.text(message);
      $message.show();
    }

    #resetClasses() {
      document.body.className = '';
      $apples.attr('class', 'guess_0');
    }

    #resetBlanks() {
      $letters.find('span').remove();
      $guesses.find('span').remove();
      for (let idx = 0; idx < this.gameWord.length; idx++) {
        let space = document.createElement('span');
        $letters.append(space);
      }
    }

    #guess(letter) {
      if (this.lettersGuessed.includes(letter)) return;

      this.#updateGuessedLetters(letter);

      if (this.gameWord.includes(letter)) {
        this.#writeCorrectLetters(letter);
        if (this.#isWon()) {
          document.body.className = 'win';
          this.#displayMessage("You win!");
          $replay.show();
          $(document).off();
        }
      } else {
        this.wrongGuesses += 1;
        $('#apples').attr('class', `guess_${this.wrongGuesses}`);
        if (this.#isLost()) {
          document.body.className = 'lose';
          this.#displayMessage("Sorry! You're out of guesses!");
          $replay.show();
          $(document).off();
        }
      }
    }

    #isLost() {
      return this.wrongGuesses >= this.maxWrongGuesses;
    }

    #isWon() {
      return $letters.find('span')
        .filter((_, element) => element.textContent === '')
        .length === 0;
    }

    #updateGuessedLetters(letter) {
      this.lettersGuessed.push(letter);
      let guessedLetterSpan = document.createElement('span');
      guessedLetterSpan.textContent = `${letter}`;
      $guesses.append(guessedLetterSpan);
    }

    #writeCorrectLetters(guessedLetter) {
      for (let index = 0; index < this.gameWord.length; index++) {
        if (this.gameWord[index] === guessedLetter) {
          let $matchedSpan = $letters.find('span').eq(index);
          $matchedSpan.text(guessedLetter);
        }
      }
    }
  }

  new Game();

  $replay.on('click', (event) => {
    event.preventDefault();
    new Game();
  });
});
