const roundStartAudio = [
  new Audio('audio/go1.mp3'),
  new Audio('audio/go2.mp3'),
  new Audio('audio/go3.mp3'),
  new Audio('audio/yeah-buddy-101soundboards.mp3'),
];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const intervalContainer = document.querySelector('.interval-container');
  const formSection = document.querySelector('.form');

  const addTimeContainer = document.querySelector('.add-time-container');
  const addRestTimeEl = document.querySelector('.add-time');
  const subtractRestTimeEl = document.querySelector('.subtract-time');

  let workOutSettings = JSON.parse(localStorage.getItem('workOutSettings')) || {};

  let startSoundIndex = 0;
  let currentlyPlayingAudio;

  const roundBGColor = {
    prepTime: 'coral',
    roundTime: 'green',
    restTime: 'red',
  };

  const roundStartText = {
    roundTime: 'Go',
    restTime: 'Rest',
  };

  const steps = ['prepTime', 'roundTime', 'restTime'];

  let currentStep = 0;
  let round = 1;
  let timeLeft = workOutSettings[steps[currentStep]] || 0;
  let isRunning = true;
  let intervalId;

  const timerContainer = document.getElementById('timer-container');
  const timerDisplay = document.getElementById('timer-display');
  const roundLengthEl = document.getElementById('round-length');
  const roundsEl = document.getElementById('rounds');
  const toggleButton = document.getElementById('toggle-button');

  const updateDisplayTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    let time =
      timeLeft >= 60
        ? `${String(minutes)}:${String(seconds).padStart(2, '0')}`
        : `${String(seconds)}`;
    timerDisplay.textContent = time;
  };

  const changeStep = () => {
    clearInterval(intervalId);
    if (round === workOutSettings.rounds && currentStep === 1) {
      endOfWorkout();
      return;
    }
    if (currentStep + 1 >= steps.length) {
      currentStep = 1;
      round++;
    } else {
      ++currentStep;
    }

    if (steps[currentStep] === 'restTime') {
      addTimeContainer.style.display = 'block';
      updateRoundLength(workOutSettings.restTime);
    } else {
      addTimeContainer.style.display = 'none';
      updateRoundLength(workOutSettings.roundTime);
    }

    roundsEl.innerHTML = `${round}/${workOutSettings.rounds}`;
    timerContainer.style.backgroundColor = roundBGColor[steps[currentStep]];
    timeLeft = workOutSettings[steps[currentStep]];
    updateDisplayTimer();
    showNextStep();
    startTimer();
  };

  const playStartRoundSound = () => {
    roundStartAudio[startSoundIndex].play();
    currentlyPlayingAudio = roundStartAudio[startSoundIndex];
    startSoundIndex = (startSoundIndex + 1) % roundStartAudio.length;
  };

  const showNextStep = () => {
    const text = roundStartText[steps[currentStep]];
    if (steps[currentStep] !== 'prepTime') {
      timerDisplay.innerText = text;
      if (steps[currentStep] === 'roundTime') {
        playStartRoundSound();
      }
      if (steps[currentStep] === 'restTime') {
        playAudio('rest1.mp3');
      }
    }
  };

  const startTimer = () => {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      console.log('Interval Running');
      if (timeLeft > 1) {
        timeLeft--;
        if (
          steps[currentStep] === 'roundTime' &&
          timeLeft === Math.round(workOutSettings.roundTime / 2) &&
          workOutSettings.roundTime >= 30
        ) {
          randomAudio(['push.mp3', 'davay.mp3', 'dontlook.mp3', 'rabotay.mp3']);
        }
        if (
          steps[currentStep] === 'roundTime' &&
          timeLeft === 10 &&
          workOutSettings.roundTime >= 20
        ) {
          playAudio('10seconds.mp3');
        }
        if (timeLeft === 10 && steps[currentStep] === 'restTime') {
          playAudio('10second.mp3');
        }
        if (timeLeft < 4) {
          playAudio('beep.mp3');
        }
        updateDisplayTimer();
      } else {
        changeStep();
      }
    }, 1000);
  };

  const toggleRunning = () => {
    isRunning = !isRunning;
    if (isRunning) {
      startTimer();
      toggleButton.textContent = 'Pause';
    } else {
      clearInterval(intervalId);
      stopCurrentlyPlayingAudio();
      toggleButton.textContent = 'Resume';
      console.log('Interval Paused');
    }
  };

  const endOfWorkout = () => {
    clearInterval(intervalId);
    timerContainer.style.backgroundColor = 'gray';
    timerDisplay.innerText = 'Gj!';

    toggleButton.removeEventListener('click', toggleButton);
    toggleButton.addEventListener('click', showForm);
    toggleButton.textContent = 'Done';

    saveWorkOut();
    playAudio('done.mp3');
  };

  function playAudio(audio) {
    const player = new Audio(`audio/${audio}`);
    currentlyPlayingAudio = player;
    player.play();
  }

  function randomAudio(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    playAudio(array[randomIndex]);
  }

  function setFormValues() {
    const inputs = document.querySelectorAll('#settings-form input');

    const values = {
      'prep-time': workOutSettings.prepTime || 10,
      'round-time': workOutSettings.roundTime || 60,
      'rest-time': workOutSettings.restTime || 30,
      'rounds-input': workOutSettings.rounds || 5,
    };

    inputs.forEach((input) => {
      if (values[input.id]) {
        input.value = values[input.id];
      }
    });
  }

  function updateRoundLength(timeSeconds) {
    const roundLength = timeSeconds;
    const minutes = Math.floor(roundLength / 60);
    const seconds = roundLength % 60;
    let time =
      roundLength >= 60
        ? `${String(minutes)}:${String(seconds).padStart(2, '0')}min`
        : `${String(seconds)}s`;

    roundLengthEl.innerHTML = time;
  }

  function stopCurrentlyPlayingAudio() {
    if (currentlyPlayingAudio) {
      currentlyPlayingAudio.pause();
      currentlyPlayingAudio.currentTime = 0;
      currentlyPlayingAudio = null;
    }
  }

  function saveWorkOut() {
    workOutHistory = JSON.parse(localStorage.getItem('workOutHistory')) || [];
    workOutHistory.push({ date: new Date(), workOutSettings });
    localStorage.setItem('workOutHistory', JSON.stringify(workOutHistory));
  }

  function showForm() {
    formSection.style.display = 'block';
    intervalContainer.style.display = 'none';
    addTimeContainer.style.display = 'none';
    clearInterval(intervalId);
    stopCurrentlyPlayingAudio();
    history.replaceState(null, '', location.pathname);
  }

  function showIntervalTimer() {
    formSection.style.display = 'none';
    intervalContainer.style.display = 'block';
  }

  function addRestTime() {
    timeLeft += 5;
    workOutSettings.restTime = workOutSettings.restTime + 5;
    updateDisplayTimer();
    updateRoundLength(workOutSettings.restTime);
  }

  function subtractRestTime() {
    if (timeLeft - 5 < 0) {
      // changeStep();
      timeLeft = 0;
    } else {
      timeLeft -= 5;
      workOutSettings.restTime = workOutSettings.restTime - 5;
    }
    updateDisplayTimer();
    updateRoundLength(workOutSettings.restTime);
  }

  setFormValues();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    workOutSettings = {
      prepTime: parseInt(document.getElementById('prep-time').value),
      roundTime: parseInt(document.getElementById('round-time').value),
      restTime: parseInt(document.getElementById('rest-time').value),
      rounds: parseInt(document.getElementById('rounds-input').value),
    };

    localStorage.setItem('workOutSettings', JSON.stringify(workOutSettings));

    showIntervalTimer();

    toggleButton.removeEventListener('click', showForm);
    toggleButton.addEventListener('click', toggleRunning);
    toggleButton.textContent = 'Pause';

    addRestTimeEl.addEventListener('click', addRestTime);
    subtractRestTimeEl.addEventListener('click', subtractRestTime);

    currentStep = 0;
    round = 1;
    timeLeft = workOutSettings[steps[currentStep]];
    updateRoundLength(workOutSettings.roundTime);
    roundsEl.innerHTML = `${round}/${workOutSettings.rounds}`;
    timerContainer.style.backgroundColor = roundBGColor[steps[currentStep]];
    updateDisplayTimer();
    startTimer();

    history.pushState({ page: 'interval' }, 'Interval', '#interval');
  });

  window.addEventListener('popstate', (event) => {
    showForm();
  });
});
