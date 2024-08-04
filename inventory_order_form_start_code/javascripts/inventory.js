"use strict";

// refactors:
// vanilla JS instead of jQuery
// handlebars instead of html string replacement
// strict ES6 syntax ('let', arrow functions, etc)

let inventory;

(function() {
  inventory = {
    lastId: 0,
    collection: [],
    setDate() {
      let date = new Date();
      document.querySelector("#order-date").textContent = date.toUTCString();
    },

    cacheTemplate() {
      let iTmpl = document.querySelector("#inventory-item");
      this.template = iTmpl.innerHTML;
      iTmpl.remove();

      // for use by newItem() later
      this.templateFunction = Handlebars.compile(this.template);
    },

    add() {
      this.lastId++;
      let item = {
        id: this.lastId,
        name: "",
        stockNumber: "",
        quantity: 1,
      };
      this.collection.push(item);

      return item;
    },

    remove(idx) {
      this.collection = this.collection.filter((item) => {
        return item.id !== idx;
      });
    },

    get(id) {
      let foundItem;

      this.collection.forEach((item) => {
        if (item.id === id) {
          foundItem = item;
          return false;
        }
      });

      return foundItem;
    },

    update(itemElement) { // renamed to keep 'item' and '$item' separate
      let id = this.findID(itemElement);
      let item = this.get(id);

      // instead of `.find(selectors).val()`, however, this is set up to
      // only ever find 1 match at a time, no need to iterate over collection
      item.name = itemElement.querySelector("[name^=item-name]").value;
      item.stockNumber = itemElement.querySelector("[name^=item-stock-number]").value;
      item.quantity = itemElement.querySelector("[name^=item-quantity]").value;
    },

    newItem(e) {
      e.preventDefault();
      let item = this.add();

      // document.querySelector("#inventory").append(itemElement);
      document.querySelector('#inventory')
              .insertAdjacentHTML('beforeend', this.templateFunction({ id: item.id }));

      // ':input' is jQuery only, selects all form controls
      // (including <input>, <select>, <textarea>, and <button>)
      // but we only need <input> elements selected so 'input' is fine.
      // also, duplicate event listeners don't get added, so it's okay that
      // this will include any old item 'td' elements already selected.
      document.querySelector('#inventory')
              .querySelectorAll('input').forEach(input => {
              input.addEventListener('blur', (e) => {
                this.updateItem(e);
              });
      });
    },

    findParent(e) {
      return e.target.closest("tr");
    },

    findID(item) {
      // again, replacing `.find(selector).val()` and only finding 1 element
      return Number(item.querySelector("input[type=hidden]").value);
    },

    deleteItem(e) {
      e.preventDefault();

      let item = this.findParent(e);
      item.remove();

      this.remove(this.findID(item));
    },

    updateItem(e) {
      let item = this.findParent(e);

      this.update(item);
    },

    bindEvents() {
      // original jQuery:
      // $("#add_item").on("click", $.proxy(this.newItem, this));

      // easy to replace with vanilla JS:
      // binding is necessary since we pass a function expression as a callback
      document.querySelector("#add-item").addEventListener("click", this.newItem.bind(this));

      // og jQuery part 2:
      // $("#inventory").on("click", "a.delete", $.proxy(this.deleteItem, this));

      // vanilla JS:
      // more in depth than needed here--could have used simple event delegation.
      // however, I wanted to match behavior of jQuery more exactly/dynamically.
      // (binding is unnecessary here with use of ES6 arrow functions):

      // add event listener to initial element
      document.querySelector("#inventory").addEventListener('click', (e) => {
        let closestMatch = e.target.closest('#inventory a.delete');
        if (closestMatch) { // finds closest desired element within initial, if any
          closestMatch.addEventListener('click', (e) => {
            this.deleteItem(e);
          }); // adds event listener to execute callback with this event target

          closestMatch.dispatchEvent(new Event('click')); // triggers listener
          closestMatch.removeEventListener('click', this.deleteItem); // cleanup
        }
      });

      // final bit of og jQuery:
      // $("#inventory").on("blur", ":input", $.proxy(this.updateItem, this));

      // IMPORTANT: blur event does not bubble!
      // variation of above solution won't trigger event listener on inventory;
      // instead, must add event listener when item made above.
      // alternative solution would be to use "focusout" event, which does bubble.
    },

    init() {
      this.setDate();
      this.cacheTemplate();
      this.bindEvents();
    },
  };
})();

document.addEventListener('DOMContentLoaded', inventory.init.bind(inventory));
