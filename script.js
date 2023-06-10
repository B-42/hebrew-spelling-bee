const LETTERS = 'טמבלרצח'.split(''),
MIN_LENGTH = 3,
MAX_LENGTH = 20,
WAIT_MS = 750,
CLICK_ANIM_MS = 100,
CENTER_INDEX = 3,
CENTER_LETTER = LETTERS[CENTER_INDEX],
MSG_TOO_LONG = 'ארוך מדי',
MSG_TOO_SHORT = 'קצר מדי',
MSG_INVALID = 'לא במילון';
let isWaiting = false;

shuffleLetters();

const beehive = get('beehive'),
text = get('text');

let x=0;
for(const i of range(5)) {
    const row = make('div');
    row.classList.add('row');
    row.id = 'row' + (i+1);

    for(let j=0; i%2==0 ? j < 1 : j < 2; j++) {
        const button = make('button');
        button.id = 'button' + (x+1);
        button.innerText = LETTERS[x];
        button.onclick = letterClicked;
        row.appendChild(button);
        x++;
    }
    
    beehive.appendChild(row);
}

function letterClicked(ev) {
    ev.target.classList.toggle('clicked');
    addText(ev.target.innerText);
    setTimeout(()=>ev.target.classList.toggle('clicked'), CLICK_ANIM_MS);
}

function addText(str) {
    text.innerText += str;
    updateText();
}

function deleteLastLetter() {
    text.innerText = text.innerText.substring(0,text.innerText.length - 1);
    updateText();
}

function shuffleLetters() {
    do {
        shuffle(LETTERS);
    } while(LETTERS[CENTER_INDEX] != CENTER_LETTER);
}

function updateButtons() {
    for(const i of range(7)) {
        get('button' + (i+1)).innerText = LETTERS[i];
    }
}

function resetText(message) {
    qsa('.row button').forEach(e=>e.onclick=null);
    showPrompt(message);
    setTimeout(() => {
        text.innerText = '';
        qsa('.row button').forEach(e=>e.onclick=letterClicked);
    }, WAIT_MS);
}

function updateText() {
    text.style.fontSize = 30 / Math.pow( text.innerText.length, 0.2 ) + 'pt';
    if(text.innerText.length > 20) {
        resetText(MSG_TOO_LONG);
    }
}

document.onkeydown = ev => {
    if(isWaiting) return;
    //console.log(ev.key);
    if(LETTERS.includes(ev.key))
        addText(ev.key);
    else if(ev.key == 'Enter')
        checkWord();
}

deleteButton.onclick = deleteLastLetter;
shuffleButton.onclick = ev => {shuffleLetters(); updateButtons();}
enterButton.onclick = checkWord;

function checkWord() {
    const word = formatWord( text.innerText );

    if(word.length < MIN_LENGTH) {
        resetText(MSG_TOO_SHORT);
        return;
    }

    // get the first letter of the word
    var firstLetter = word[0];

    // Filter the words based on the starting letter
    const filteredWords = dictionary[firstLetter];

    // Check if the word is in the filtered list
    var isValid = filteredWords.includes(word);

    if(isValid) {
        stats.innerText += word + "\t";
    }
    
    resetText(isValid ? '' : MSG_INVALID);
}

function removeNiqqud(word) {
    // Remove all characters that are classified as Niqqud
    var withoutNiqqud = word.replace(/[\u0591-\u05C7]/g, '');
    return withoutNiqqud;
}

function formatWord(word){
    word = removeNiqqud(word);
    // remove all spaces, commas, and periods and any other punctuation
    return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}

function showPrompt(message, duration=WAIT_MS) {
    promptBar.innerText = message;
    promptBar.classList.toggle('hide');
    isWaiting = true;
    setTimeout(()=>{
        promptBar.classList.toggle('hide');
        isWaiting = false;
    }, duration);
}