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
  enableForm(form);
}

function generateExercises(operatorsList, numberOfExercises) {
  const exercises = [];
  for (let i = 1; i <= numberOfExercises; i++) {
    const x = Math.floor(Math.random() * 101);
    const y = Math.floor(Math.random() * 101);
    const randomOperator = operatorsList[Math.floor(Math.random() * operatorsList.length)];
    let solution = 0;
    if (randomOperator === '+') {
      solution = x + y;
    } else if (randomOperator === '-') {
      solution = x - y;
    } else if (randomOperator === '*') {
      solution = x * y;
    } else {
      solution = Math.floor(x / y);
    }

    const exercise = { operand1: x, operand2: y, operator: randomOperator, opSolution: solution };
    exercises.push(exercise);
  }
  return exercises;
}

function shuffleArray(array) {
  for (let i = 0; i < array.length; i++) {
    const j = Math.floor(Math.random() * array.length);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function addGameComponents(exercises) {
  const boxContainer = document.createElement('div');
  boxContainer.classList.add('box-container');

  const exerciseIndexes = [];
  const solutionIndexes = [];
  for (let i = 0; i < exercises.length; i++) {
    exerciseIndexes.push(i);
    solutionIndexes.push(i);
  }

  shuffleArray(exerciseIndexes);
  shuffleArray(solutionIndexes);

  for (let i = 0; i < exercises.length; i++) {
    const boxLeft = document.createElement('div');
    boxLeft.classList.add('box-exercise');
    const exerciseText =
      exercises[exerciseIndexes[i]].operand1 +
      exercises[exerciseIndexes[i]].operator +
      exercises[exerciseIndexes[i]].operand2;
    boxLeft.innerText = exerciseText;
    const boxRight = document.createElement('div');
    boxRight.classList.add('box-solution');
    const solutionText = exercises[solutionIndexes[i]].opSolution;
    boxRight.innerText = solutionText;
    if (i === 0) {
      boxLeft.style.marginTop = '70px';
      boxRight.style.marginTop = '70px';
    }
    boxContainer.append(boxLeft);
    boxContainer.append(boxRight);
  }
  document.body.append(boxContainer);
}

function removeGameComponents() {
  const boxContainer = document.querySelector('.box-container');
  const boxesExercise = document.querySelectorAll('.box-exercise');
  const boxesSolution = document.querySelectorAll('.box-solution');
  boxesExercise.forEach((box) => box.parentNode.removeChild(box));
  boxesSolution.forEach((box) => box.parentNode.removeChild(box));
  boxContainer.parentNode.removeChild(boxContainer);
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
    const select = document.getElementById('number-of-exercises');
    const numberOfExercises = select.options[select.selectedIndex].value;
    console.log(numberOfExercises);
    const operatorsList = [];
    const checkboxes = document.forms['my-form'].querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        operatorsList.push(checkboxes[i].value);
      }
    }
    console.log(operatorsList);
    const exercises = generateExercises(operatorsList, numberOfExercises);
    exercises.forEach((exercise) => console.log(exercise));
    addGameComponents(exercises);
  } else {
    const form = document.forms['my-form'];
    resetForm(form);
    submitButton.innerText = 'Vágjunk bele!';
    removeGameComponents();
  }
}

window.onload = () => {
  const form = document.forms[0];
  form.addEventListener('submit', submitForm);
};
