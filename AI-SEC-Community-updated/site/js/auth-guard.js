/* login.html / register.html have no backend yet. Never submit credentials anywhere:
   block the submit, wipe the password fields and tell the visitor. Remove this file
   only when real, server-side authentication exists. */
(function () {
  'use strict';
  document.querySelectorAll('form.auth-form').forEach(function (form) {
    form.setAttribute('autocomplete', 'off');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('input[type="password"]').forEach(function (i) { i.value = ''; });
      var note = form.querySelector('.auth-form__note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'auth-form__note';
        note.setAttribute('role', 'status');
        form.appendChild(note);
      }
      note.textContent = 'Member accounts are not available yet. Nothing was sent.';
    });
  });
})();
