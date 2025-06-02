let spellers = [];
let regularWords = [];
let killerWords = [];
let currentSpellerIndex = null;
let currentWord = null;
let currentRound = 1;

function selectSpellers() {
  const num = parseInt(document.getElementById('spellerCount').value);
  const container = document.getElementById('spellerTable');
  container.innerHTML = '';

  spellers = [];
  for (let i = 0; i < num; i++) {
    spellers.push({ active: true, hasActed: false });
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <tr>
      <th>Speller #</th>
      <th>Active?</th>
    </tr>
  `;

  spellers.forEach((speller, index) => {
    const row = document.createElement('tr');
    row.id = `spellerRow${index}`;
    row.innerHTML = `
      <td>Speller ${index + 1}</td>
      <td><input type="checkbox" checked id="spellerCheck${index}" onchange="toggleSpeller(${index})"></td>
    `;
    table.appendChild(row);
  });

  container.appendChild(table);
  currentSpellerIndex = getNextActiveSpeller();
  updateWordCount();
  updateRoundDisplay();
  highlightCurrentSpeller();
}

function toggleSpeller(index) {
  spellers[index].active = document.getElementById(`spellerCheck${index}`).checked;
}

function uploadCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.trim().split('\n');
    rows.shift(); // Remove header

    const wordList = rows
      .map(row => row.split(',').map(cell => cell.trim()))
      .filter(cells => cells.length >= 7 && cells[0]);

regularWords = wordList.filter(row => row[6]?.trim().toLowerCase() === "regular");
killerWords = wordList.filter(row => row[6]?.trim().toLowerCase() === "killer");

    alert(`Loaded ${wordList.length} words: ${regularWords.length} regular, ${killerWords.length} killer.`);
    updateWordCount();
  };
  reader.readAsText(file);
}

function getNextActiveSpeller(currentIndex = null) {
  const total = spellers.length;
  const start = currentIndex === null ? -1 : currentIndex;

  for (let offset = 1; offset <= total; offset++) {
    const nextIndex = (start + offset) % total;
    if (spellers[nextIndex].active) return nextIndex;
  }
  return null; // No active spellers
}



function highlightCurrentSpeller() {
  spellers.forEach((_, i) => {
    const row = document.getElementById(`spellerRow${i}`);
    if (row) {
      row.style.backgroundColor = i === currentSpellerIndex ? '#ffffcc' : '';
    }
  });
}

function displayWord(wordData) {
  const [word, uk, us, meaning, example, pos, type] = wordData;
  document.getElementById('wordDisplay').innerHTML = `
    <strong>Speller ${currentSpellerIndex + 1}</strong><br>
    <strong>Word:</strong> ${word} <br>
    <strong>UK:</strong> /${uk}/ &nbsp;&nbsp; <strong>US:</strong> /${us}/ <br>
    <strong>Meaning:</strong> ${meaning} <br>
    <strong>Example:</strong> ${example} <br>
    <strong>Part of Speech:</strong> ${pos} <br>
    <strong>Type:</strong> ${type}
  `;
}

function newWord() {
  if (regularWords.length === 0) {
    alert("No more regular words!");
    return;
  }
  if (currentSpellerIndex === null) {
    alert("No active spellers remaining.");
    return;
  }

  currentWord = regularWords.shift();
  displayWord(currentWord);
  updateWordCount();
  highlightCurrentSpeller();
}

function killerWord() {
  if (killerWords.length === 0) {
    alert("No more killer words!");
    return;
  }
  if (currentSpellerIndex === null) {
    alert("No active spellers remaining.");
    return;
  }

  currentWord = killerWords.shift();
  displayWord(currentWord);
  updateWordCount();
  highlightCurrentSpeller();
}

function markCorrect() {
  if (currentSpellerIndex === null || !currentWord) {
    alert("No word is currently active.");
    return;
  }

  const row = document.createElement('div');
  row.textContent = `Round ${currentRound}: Speller ${currentSpellerIndex + 1} spelled "${currentWord[0]}" correctly.`;
  document.getElementById('ledger').appendChild(row);

  currentWord = null;
  moveToNextSpeller();
}

function disqualifySpeller() {
  if (currentSpellerIndex === null || !currentWord) {
    alert("No word is currently active.");
    return;
  }

  const row = document.createElement('div');
  row.textContent = `Round ${currentRound}: Speller ${currentSpellerIndex + 1} was disqualified on word "${currentWord[0]}".`;
  document.getElementById('ledger').appendChild(row);

  spellers[currentSpellerIndex].active = false;
  const checkbox = document.getElementById(`spellerCheck${currentSpellerIndex}`);
  if (checkbox) checkbox.checked = false;

  currentWord = null;
  moveToNextSpeller();
}

function moveToNextSpeller() {
  currentSpellerIndex = getNextActiveSpeller(currentSpellerIndex);
  document.getElementById('wordDisplay').innerHTML = '';
  updateWordCount();
  highlightCurrentSpeller();
}


function newRound() {
  currentRound++;
  document.getElementById('wordDisplay').innerHTML = '';
  updateRoundDisplay();
  currentSpellerIndex = getNextActiveSpeller();
  highlightCurrentSpeller();
  updateWordCount();
  alert(`Round ${currentRound} started.`);
}

function updateWordCount() {
  const p = document.getElementById('wordCount');
  if (p) {
    p.textContent = `Words remaining — Regular: ${regularWords.length}, Killer: ${killerWords.length}`;
  }
}

function updateRoundDisplay() {
  const roundDisplay = document.getElementById('roundDisplay');
  if (roundDisplay) {
    roundDisplay.textContent = `Current Round: ${currentRound}`;
  }
}
