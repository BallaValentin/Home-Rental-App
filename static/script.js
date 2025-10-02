function loadAdvertisementDetails(advertisementID) {
  const advertisementDiv = document.getElementById(`advertisement-${advertisementID}`);
  const extraDetailsDiv = advertisementDiv.querySelector('.extra-details');
  let errorDiv = advertisementDiv.querySelector('p.error-message');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/advertisement_detailed?advertisementID=${advertisementID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);

      if (response.messageType === 'ok') {
        if (errorDiv) {
          advertisementDiv.removeChild(errorDiv);
        }
        const { noRooms } = response.advertisement;
        const { uploadDate } = response.advertisement;
        if (!extraDetailsDiv.innerText) {
          extraDetailsDiv.innerText = `Number of rooms: ${noRooms}\nUpload date: ${uploadDate}`;
          extraDetailsDiv.style.display = 'block';
        } else {
          extraDetailsDiv.innerText = null;
          extraDetailsDiv.style.display = 'none';
        }
      } else if (!errorDiv) {
        errorDiv = document.createElement('p');
        errorDiv.className = 'error-message';
        errorDiv.innerText = 'Failed to load the details of advertisment.';
        document.getElementById(`advertisement-${advertisementID}`).appendChild(errorDiv);
      }
    }
  };
  xhr.send();
}

function deletePicture(imageID) {
  let errorDiv = document.querySelector('p.error-message2');
  console.log(errorDiv);
  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/delete_picture?pictureID=${imageID}`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.messageType === 'ok') {
        if (errorDiv) {
          document.body.removeChild(errorDiv);
        }
        const imageContainerDiv = document.getElementById(`image-container-${imageID}`);
        imageContainerDiv.parentNode.removeChild(imageContainerDiv);
      } else if (!errorDiv) {
        errorDiv = document.createElement('p');
        errorDiv.className = 'error-message2';
        errorDiv.innerText = 'Error when deleting image.';
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
        if (lastMessage.senderID === you) {
          textArea.value = '';
          const messageBoxNameDiv = document.createElement('div');
          messageBoxNameDiv.innerText = 'You:';
          messageBoxNameDiv.className = 'message-box-name';

          const messageTextDiv = document.createElement('div');
          messageTextDiv.innerText = lastMessage.text;

          const messageBoxDateDiv = document.createElement('div');
          messageBoxDateDiv.innerText = lastMessage.sendDate;
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
  console.log(`UserID: ${userID}, message: ${textArea.value}`);
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
        console.log('The role of the user has been updated successfully');
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
    idCell.textContent = user.userID;
    row.appendChild(idCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = user.nev;
    row.appendChild(nameCell);

    const roleCell = document.createElement('td');

    if (userID !== user.userID) {
      const select = document.createElement('select');
      select.id = `select_${user.userID}`;
      select.setAttribute('data-user-id', user.userID);
      select.onchange = () => updateUserRole(user.userID);

      const adminOption = document.createElement('option');
      adminOption.value = 'admin';
      adminOption.textContent = 'admin';
      if (user.role === 'admin') {
        adminOption.selected = true;
      }

      const userOption = document.createElement('option');
      userOption.value = 'user';
      userOption.textContent = 'user';
      if (user.role === 'user') {
        userOption.selected = true;
      }

      select.appendChild(adminOption);
      select.appendChild(userOption);
      roleCell.appendChild(select);
    } else {
      roleCell.textContent = user.role;
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

function deleteAdvertisement(advertisementID) {
  console.log(`LELE: ${advertisementID}`);
  const advertisement = document.getElementById(`advertisement-${advertisementID}`);
  const xhr = new XMLHttpRequest();
  xhr.open('delete', `/delete_advertisement?advertisementID=${advertisementID}`, true);
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

function addCities() {
  const cityDatalistDiv = document.getElementById('city-datalist');
  const xhr = new XMLHttpRequest();
  xhr.open('get', '/get_cities', true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.type === 'ok') {
        cityDatalistDiv.innerHTML = '';
        response.cities.forEach((city) => {
          const option = document.createElement('option');
          option.value = city.varosnev;
          cityDatalistDiv.appendChild(option);
        });
      }
    }
  };
  xhr.send();
}

function addCityQuarters() {
  const cityDatalistDiv = document.getElementById('city-quarter-datalist');
  const xhr = new XMLHttpRequest();
  xhr.open('get', '/get_city_quarters', true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.type === 'ok') {
        cityDatalistDiv.innerHTML = '';
        response.quarters.forEach((quarter) => {
          const option = document.createElement('option');
          option.value = quarter.cityQuarterName;
          cityDatalistDiv.appendChild(option);
        });
      }
    }
  };
  xhr.send();
}

window.sendMessage = sendMessage;
window.deletePicture = deletePicture;
window.loadAdvertisementDetails = loadAdvertisementDetails;
window.deleteAdvertisement = deleteAdvertisement;
window.addCities = addCities;
window.addCityQuarters = addCityQuarters;

window.onload = () => {
  const usersTable = document.getElementById('users-table');
  if (usersTable) {
    const roleSelects = usersTable.querySelectorAll('.role-select');
    roleSelects.forEach((roleSelect) => {
      roleSelect.addEventListener('change', () => {
        updateUserRole();
      });
    });
  }
  const userSearchDiv = document.getElementById('user-search');
  if (userSearchDiv) {
    userSearchDiv.addEventListener('input', () => {
      searchUsers();
    });
  }
};
