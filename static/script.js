function loadAdvertisementDetails(hirdetesID) {
  const advertisementDiv = document.getElementById(`advertisement-${hirdetesID}`);
  const extraDetailsDiv = advertisementDiv.querySelector('.extra-details');
  let errorDiv = advertisementDiv.querySelector('p.error-message');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/advertisement_detailed?advertisementID=${hirdetesID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);

      if (response.messageType === 'ok') {
        if (errorDiv) {
          advertisementDiv.removeChild(errorDiv);
        }
        const szobSzama = response.advertisement.szobakSzama;
        const feltoltesDatuma = response.advertisement.feltDatum;
        extraDetailsDiv.innerText = `Szobák száma: ${szobSzama}\nFeltöltés dátuma: ${feltoltesDatuma}`;
        extraDetailsDiv.style.display = 'block';
      } else if (!errorDiv) {
        errorDiv = document.createElement('p');
        errorDiv.className = 'error-message';
        errorDiv.innerText = 'Hiba a lakáshirdetés részleteinek betöltésekor.';
        document.getElementById(`advertisement-${hirdetesID}`).appendChild(errorDiv);
      }
    }
  };
  xhr.send();
}

function deletePicture(kepID) {
  let errorDiv = document.querySelector('p.error-message2');
  console.log(errorDiv);
  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/delete_picture?pictureID=${kepID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.messageType === 'ok') {
        if (errorDiv) {
          document.body.removeChild(errorDiv);
        }
        const imageContainerDiv = document.getElementById(`image-container-${kepID}`);
        imageContainerDiv.parentNode.removeChild(imageContainerDiv);
      } else if (!errorDiv) {
        errorDiv = document.createElement('p');
        errorDiv.className = 'error-message2';
        errorDiv.innerText = 'Hiba a kép törlésekor.';
        document.body.appendChild(errorDiv);
      }
    }
  };
  xhr.send();
}

function sendMessage(userID) {
  const sendMessageDiv = document.getElementById('send-message');
  const textArea = sendMessageDiv.getElementsByTagName('textarea')[0];
  const messageLog = document.getElementById('message-log');
  const xhr = new XMLHttpRequest();
  xhr.open('post', '/send_message', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.type === 'ok') {
        const { messages, you } = response;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.kuldoID === you) {
          textArea.innerText = '';
          const messageBoxNameDiv = document.createElement('div');
          messageBoxNameDiv.innerText = 'Te:';
          messageBoxNameDiv.className = 'message-box-name';

          const messageTextDiv = document.createElement('div');
          messageTextDiv.innerText = lastMessage.szoveg;

          const messageBoxDateDiv = document.createElement('div');
          messageBoxDateDiv.innerText = lastMessage.kuldesiIdo;
          messageBoxDateDiv.className = 'message-box-date';

          const newMessageDiv = document.createElement('div');
          newMessageDiv.className = 'your-message-box';
          newMessageDiv.appendChild(messageBoxNameDiv);
          newMessageDiv.appendChild(messageTextDiv);
          newMessageDiv.appendChild(messageBoxDateDiv);

          messageLog.appendChild(newMessageDiv);
        }
      }
    }
  };
  const data = `recipientUserID=${encodeURIComponent(userID)}&message=${encodeURIComponent(textArea.value)}`;
  xhr.send(data);
}

function updateUserRole(userID) {
  const selectDiv = document.getElementById(`select_${userID}`);
  const newRole = selectDiv.value;
  const xhr = new XMLHttpRequest();
  xhr.open('post', '/update_role', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.type === 'ok') {
        console.log('Sikerult frissiteni a felhasznalo szerepet');
      }
    }
  };
  const data = `userID=${encodeURIComponent(userID)}&newRole=${encodeURIComponent(newRole)}`;
  xhr.send(data);
}

function updateTable(users, userID) {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = '';

  users.forEach((user) => {
    const row = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.textContent = user.felhID;
    row.appendChild(idCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = user.nev;
    row.appendChild(nameCell);

    const roleCell = document.createElement('td');

    if (userID !== user.felhID) {
      const select = document.createElement('select');
      select.id = `select_${user.felhID}`;
      select.setAttribute('data-user-id', user.felhID);
      select.onchange = () => updateUserRole(user.felhID);

      const adminOption = document.createElement('option');
      adminOption.value = 'admin';
      adminOption.textContent = 'admin';
      if (user.szerep === 'admin') {
        adminOption.selected = true;
      }

      const userOption = document.createElement('option');
      userOption.value = 'user';
      userOption.textContent = 'user';
      if (user.szerep === 'user') {
        userOption.selected = true;
      }

      select.appendChild(adminOption);
      select.appendChild(userOption);
      roleCell.appendChild(select);
    } else {
      roleCell.textContent = user.szerep;
    }

    row.appendChild(roleCell);
    tableBody.appendChild(row);
  });
}

function searchUsers(userID) {
  const userSearchDiv = document.getElementById('user-search');
  const pattern = userSearchDiv.value;
  const xhr = new XMLHttpRequest();
  xhr.open('get', `/search_users?pattern=${pattern}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.type === 'ok') {
        console.log(response.users);
        updateTable(response.users, userID);
      }
    }
  };
  xhr.send();
}

function deleteAdvertisement(hirdetesID) {
  console.log(`LELE: ${hirdetesID}`);
  const advertisement = document.getElementById(`advertisement-${hirdetesID}`);
  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/delete_advertisement?advertisementID=${hirdetesID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.messageType === 'ok') {
        advertisement.parentNode.removeChild(advertisement);
      }
    }
  };
  xhr.send();
}

window.onload = () => {
  const advertisements = document.getElementsByClassName('advertisement');
  for (let i = 0; i < advertisements.length; i++) {
    advertisements[i].addEventListener('click', () => {
      const hirdetesID = advertisements[i].id.replace('advertisement-', '');
      loadAdvertisementDetails(hirdetesID);
    });
  }
  const imageContainers = document.getElementsByClassName('image-container');
  for (let i = 0; i < imageContainers.length; i++) {
    const deleteButton = imageContainers[i].getElementsByTagName('button')[0];
    deleteButton.addEventListener('click', () => {
      const kepID = imageContainers[i].id.replace('image-container-', '');
      deletePicture(kepID);
    });
  }

  const sendMessageDiv = document.getElementById('send-message');
  console.log(sendMessageDiv);
  const submitMessageButton = sendMessageDiv.getElementsByTagName('button')[0];
  submitMessageButton.addEventListener('click', () => {
    sendMessage();
  });

  const usersTable = document.getElementById('users-table');
  const roleSelects = usersTable.querySelectorAll('.role-select');
  roleSelects.forEach((roleSelect) => {
    roleSelect.addEventListener('change', () => {
      updateUserRole();
    });
  });
  const userSearchDiv = document.getElementById('user-search');
  userSearchDiv.addEventListener('input', () => {
    searchUsers();
  });

  advertisements.forEach((advertisement) => {
    const deleteButton = advertisement.getElementsByClassName('button')[0];
    deleteButton.addEventListener('click', () => {
      deleteAdvertisement();
    });
  });
};
