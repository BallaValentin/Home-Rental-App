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
  if (!Number.isInteger(Number(field[0].value))) {
    alert('Helytelen mező!');
    return;
  }
  if (parseInt(field[0].value, 10) <= 0 || parseInt(field[0].value, 10) > 1000000000) {
    alert('Helytelen mező!');
  }
}

function validateSearchForm(event) {
  event.preventDefault();
}

function loadAdvertisementDetails(hirdetesID) {
  const advertisementDiv = document.getElementById(`advertisement-${hirdetesID}`);
  const extraDetailsDiv = advertisementDiv.querySelector('.extra-details');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/advertisement_detailed?advertisementID=${hirdetesID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);

      const szobSzama = response.advertisement.szobakSzama;
      const feltoltesDatuma = response.advertisement.feltDatum;

      extraDetailsDiv.innerHTML = `Szobák száma: ${szobSzama} <br>Feltöltés dátuma: ${feltoltesDatuma}`;
      extraDetailsDiv.style.display = 'block';
    }
  };
  xhr.send();
}

function deletePicture(kepID) {
  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/delete_picture?pictureID=${kepID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const imageContainerDiv = document.getElementById(`image-container-${kepID}`);
      imageContainerDiv.parentNode.removeChild(imageContainerDiv);
    }
  };
  xhr.send();
}

window.onload = () => {
  const advertisementForm = document.getElementById('advertisement-uploader-form');
  if (advertisementForm !== null) {
    advertisementForm.addEventListener('clicked', validateAdvertisementForm);
  }
  const imageForm = document.getElementById('image-uploader-form');
  if (imageForm !== null) {
    imageForm.addEventListener('clicked', validateImageForm);
  }
  const searchForm = document.getElementById('advertisement-search-form');
  searchForm.addEventListener('clicked', validateSearchForm);
  const advertisements = document.getElementsByClassName('advertisement');
  for (let i = 0; i < advertisements.length; i++) {
    advertisements[i].addEventListener('click', () => {
      const hirdetesID = advertisements[i].id.replace('advertisement-', '');
      loadAdvertisementDetails(hirdetesID);
    });
  }
  const imageContainers = document.getElementsByClassName('image-container');
  for (let i = 0; i < imageContainers.length; i++) {
    const deleteButton = imageContainers[i].getElementByTagName('button');
    deleteButton.addEventListener('click', () => {
      const kepID = imageContainers[i].id.replace('image-container-', '');
      deletePicture(kepID);
    });
  }
};
