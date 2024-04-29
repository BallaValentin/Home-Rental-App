function validateAdvertisementForm(event) {
  event.preventDefault();
  const form = document.getElementById('advertisement-uploader-form');
  const field = form.querySelectorAll('input');
  let isCompleted = true;
  for (let i = 0; i < field.length; i++) {
    if (field[i].value === '') {
      isCompleted = false;
      break;
    }
  }
  if (!isCompleted) {
    alert('Nincs minden mező kitöltve!');
    return;
  }

  let hasValidNumbers = true;
  for (let i = 2; i < 5; ++i) {
    if (!Number.isInteger(Number(field[i].value))) {
      hasValidNumbers = false;
      break;
    } else if (parseInt(field[i].value, 10) <= 0 || parseInt(field[i].value, 10) > 1000000000) {
      hasValidNumbers = false;
      break;
    }
  }

  if (!hasValidNumbers) {
    alert('Helytelen mező!');
  }
}

function validateImageForm(event) {
  event.preventDefault();
  const form = document.getElementById('image-uploader-form');
  console.log(form);
}

function validateSearchForm(event) {
  event.preventDefault();
  const form = document.getElementById('advertisement-search-form');
  console.log(form);
}

window.onload = () => {
  const advertisementForm = document.getElementById('advertisement-uploader-form');
  if (advertisementForm !== null) {
    advertisementForm.addEventListener('submit', validateAdvertisementForm);
  }
  const imageForm = document.getElementById('image-uploader-form');
  if (imageForm !== null) {
    advertisementForm.addEventListener('submit', validateImageForm);
  }
  const searchForm = document.getElementById('advertisement-search-form');
  searchForm.addEventListener('submit', validateSearchForm);
};
