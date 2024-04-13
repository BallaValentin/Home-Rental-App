function disableForm(form) {
  const formElements = form.elements;

  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].type !== 'submit') {
      formElements[i].disabled = true;
    }
  }
}

function enableForm(form) {
  const formElements = form.elements;

  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].type !== 'submit') {
      formElements[i].disabled = false;
    }
  }
}

function validateForm(form) {
  const fullname = form.fullname.value;
  if (fullname === '') {
    alert('A név mező nincs kitöltve!');
    return false;
  }
  if (!/^[A-Za-z].*[A-Za-z0-9]$/.test(fullname)) {
    alert('Helytelen név formátum!');
    return false;
  }
  const checkboxes = document.forms['my-form'].querySelectorAll('input[type="checkbox"]');
  let isChecked = false;
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      isChecked = true;
      break;
    }
  }
  if (!isChecked) {
    alert('Legalább egy műveletet ki kell válassz!');
    return false;
  }
  return true;
}

function resetForm(form) {
  form.reset();
  enableForm(form);
}

function submitForm(event) {
  event.preventDefault();
  const submitButton = document.querySelector('#submit-button');

  if (submitButton.innerText === 'Vágjunk bele!') {
    const form = document.forms['my-form'];
    if (validateForm(form) === false) {
      return;
    }
    disableForm(form);
    submitButton.innerText = 'Újrakezdés!';
  } else {
    const form = document.forms['my-form'];
    resetForm(form);
    submitButton.innerText = 'Vágjunk bele!';
  }
}

window.onload = () => {
  const form = document.forms[0];
  form.addEventListener('submit', submitForm);
};
