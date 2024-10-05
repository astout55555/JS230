"use strict";

/*

Remaining (optional) problem:
  I'd like edit form tags select element to default to selecting any pre-existing
  tags for the contact. That way submitting the edit form without making changes
  will not change the tags for the contact (like other data, it stays the same).

(Also, if this were the assessment, I'd want to refactor and improve organization.)

Data notes:
  -tags are not stored on server, must be tracked by contact manager instance
  -tags are objects stored in an array (this.allTags)
    -each tag object is a simple {tagName: valueString}
      -this makes it easier to display tag names in handlebars template
  -because tags are not stored in server, they are lost on page refreshes
    unless used by a contact, in which case the tag list includes it.
    -this means that tags will automatically be removed upon refresh when
      removed from the final contact using it, during editing or deletion
      -and, if you try to filter with it, it will display "no contacts found"
        -seems good enough for my purposes
  -tag selections are optional--choosing none means contact tags value is null

*/

$(() => {
  const templates = {};

  document.querySelectorAll("script[type='text/x-handlebars']").forEach(tmpl => {
    templates[tmpl["id"]] = Handlebars.compile(tmpl["innerHTML"]);
  });

  document.querySelectorAll("[data-type=partial]").forEach(tmpl => {
    Handlebars.registerPartial(tmpl["id"], tmpl["innerHTML"]);
  });

  // Handlebars.registerHelper('isContactTag', (tagName, contactID) => {
    // // fetch won't work to compare contact tags with tagName
    // // (async interacting with sync code), and very slow besides
    // // (1 fetch per tag option). could I fetch once for the contact
    // // somewhere else, use that data to check for matches, and
    // // somehow pass that info to the handlebars with the rest of the context?
  // });

  class ContactManager {
    constructor() { // initialize properties and display, add event listeners
      this.allTags = []; // server does not track list of tags, so I have to

      this.#initializeDisplay();

      $('#search-form').on('submit', event => {
        event.preventDefault();
        let searchTerm = $('#search-bar').val();
        this.filterContactsByName(searchTerm);
        event.target.reset();
      });

      $('#tags-list').on('click', 'button', event => {
        let tagName = event.target.textContent;
        this.filterContactsByTag(tagName);
      });

      $('.add-form-toggler').on('click', () => {
        this.toggleAdd();
      });

      $('#contacts-list').on('click', '.edit-form-unveiler, .contact-deleter', event => {
        let contactID = event.target.getAttribute('data-id');

        if (event.target.classList.contains('edit-form-unveiler')) {
          this.toggleEdit(contactID);  
        } else if (event.target.classList.contains('contact-deleter')) {
          this.deleteContact(contactID);
        }
      });

      $('#create-tag-form').on('submit', event => {
        event.preventDefault();
        let tagName = event.currentTarget.querySelector('input').value;
        this.createTag(tagName);
        event.currentTarget.reset();
      });

      $('#contacts-list').on('submit', '.edit-contact-form', event => {
        event.preventDefault();
        let contactID = event.target.getAttribute('data-id');
        this.editContact(contactID);
        this.toggleEdit(contactID);
      });

      $('#add-contact-form').on('submit', event => {
        event.preventDefault();
        // this.addContact($('#add-contact-form'));
        this.addContact(new FormData(event.target));
        event.target.reset();
        this.toggleAdd();
      });
    }

    deleteContact(contactID) {
      fetch(`http://localhost:3000/api/contacts/${contactID}`, {
        method: 'DELETE',
        body: `id=${contactID}`,
      }).then(alert('Contact deleted.'));

      $(`#contact-div-${contactID}`).remove();
    }

    #initializeDisplay() {
      fetch('/api/contacts')
        .then(response => response.json())
        .then(allContacts => {
          this.displayContacts(allContacts);
          this.resetTags(allContacts);
          this.displayTagFilters();
          this.populateTagOptions($('#add-contact-tags'));
      });
    }

    filterContactsByName(searchTerm) {
      fetch('/api/contacts')
        .then(response => response.json())
        .then(allContacts => {
          let filteredContacts = allContacts.filter(contact => {
            let formattedName = contact.full_name.toLowerCase();
            let formattedTerm = searchTerm.toLowerCase();
            return formattedName.includes(formattedTerm);
          });

          this.displayContacts(filteredContacts);
      });
    }

    filterContactsByTag(tagName) {
      fetch('/api/contacts')
        .then(response => response.json())
        .then(allContacts => {
          let filteredContacts = allContacts.filter(contact => {
            if (contact.tags) {
              return contact.tags.split(',').includes(tagName);
            }
          });

          this.displayContacts(filteredContacts);
      });
    }

    displayContacts(contacts) {
      $('#contacts-list').html(templates.contacts({contacts: contacts}));
    }

    updateContact(contactData) {
      $(`#contact-div-${contactData.id}`)
        .html(templates.contact(contactData));
    }

    resetTags(allContacts) {
      this.allTags = [];
      allContacts.forEach(contact => {
        if (contact.tags) {
          let contactTags = contact.tags.split(',');
          let newTagNames = contactTags.filter(name => this.isNewTag(name));
          newTagNames.forEach(newTagName => {
            this.allTags.push({tagName: newTagName});
          });
        }
      });
    }

    displayTagFilters() {
      $('#tags-list').append(templates.tagFilters({tagFilters: this.allTags}));
    }

    populateTagOptions($selectElement) {
      $selectElement.html(templates.tagOptions({tagOptions: this.allTags}));
    }

    toggleAdd() {
      $('#add-contact-form').toggle();
      $('#add-form-unveiler').toggle();
    }

    toggleEdit(contactID) {
      let $unveiler = $(`#edit-form-unveiler-${contactID}`);
      $unveiler.toggle();
      $(`#edit-contact-form-${contactID}`).toggle();
      this.populateTagOptions($(`#edit-contact-tags-${contactID}`));
    }

    addContact(formData) {
      let tagsArray = formData.getAll('tags');
      formData.set('tags', tagsArray.join(','));

      fetch('http://localhost:3000/api/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: new URLSearchParams([...formData]),
      })
      .then(response => response.json())
      .then(contactData => {
        $('#contacts-list').append(templates.contact(contactData));
      });
    }

    editContact(contactID) {
      let targetForm = document.querySelector(`#edit-contact-form-${contactID}`);
      let formData = new FormData(targetForm);
      let tagsArray = formData.getAll('tags');
      formData.set('tags', tagsArray.join(','));

      fetch(`http://localhost:3000/api/contacts/${contactID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams([...formData]),
      })
      .then(response => response.json())
      .then(contactData => {
        this.updateContact(contactData);
      });
    }

    createTag(name) {
      if (this.isNewTag(name)) {
        this.allTags.push({tagName: name});
        $('#tags-list').append(templates.tagFilter({tagName: name}));
        $('#add-contact-tags').append(templates.tagOption({tagName: name}));  
      }
    }

    isNewTag(newName) {
      let allTagNames = this.allTags.map(tag => tag.tagName);
      return !allTagNames.includes(newName);
    }
  }

  new ContactManager();
});