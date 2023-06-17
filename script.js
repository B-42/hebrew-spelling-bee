//const LETTERS = 'מישהודי'.split(''),
const LETTERS = 'אבהנצרי'.split(''),
MIN_LENGTH = 4,
MAX_LENGTH = 20,
LONG_WAIT = 600,
MID_WAIT = 300,
SHORT_WAIT = 100,
CENTER_INDEX = 3,
CENTER_LETTER = LETTERS[CENTER_INDEX],
MSG_TOO_LONG = 'ארוך מדי',
MSG_TOO_SHORT = 'קצר מדי',
MSG_INVALID = 'לא במילון',
MSG_INVALID_KEY = 'לא במחסן האותיות',
MSG_NO_CENTER = `חובה להשתמש באות האמצעית`,
usedWords = {},
RGX_HEB_LETTER = /[א-ת]/,
RGX_END_NORMAL = /[מנצפכ]/,
RGX_END_LAST = /[םןץףך]/,
END_LETTERS_DICT = {},
END_LETTER_PAIRS = [
    'מם', 'נן', 'צץ', 'פף', 'כך'
],
PAUSE_WHILE_MSG = false,
BULLET = '•';


for(const pair of END_LETTER_PAIRS) {
    END_LETTERS_DICT[pair[0]] = pair[1];
    END_LETTERS_DICT[pair[1]] = pair[0];
}

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

for(const rank of RANKS) {
    const rankDot = make('span');
    rankDot.innerText = BULLET;
    rankDot.classList.add('rankdot');

    const rankWord = make('span');
    rankWord.innerText = rank.title;
    rankWord.classList.add('rankword');

    const rankDiv = make('div');
    rankDiv.appendChild(rankDot);
    rankDiv.appendChild(rankWord);
    rankDiv.classList.add('rankdiv');

    //rankDots.insertBefore(rankDot, rankDots.children[0]);
    //rankWords.appendChild(rankWord);
    rankContainer.insertBefore(rankDiv, rankContainer.children[0]);

    rank.html = {dot: rankDot, word: rankWord};
}
updateRank();

function letterClicked(ev) {
    ev.target.classList.toggle('clicked');
    addText(ev.target.innerText);
    setTimeout(()=>ev.target.classList.toggle('clicked'), SHORT_WAIT);
}

function addText(str) {
    const letterSpan = make('span');
    letterSpan.innerText = str;
    if(str == CENTER_LETTER) letterSpan.classList.add('centerLetter');
    text.appendChild(letterSpan);
    updateText();
}

function deleteLastLetter() {
    text.removeChild(text.children[text.children.length - 1]);
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
    if(message) showPrompt(message);
    setTimeout(() => {
        text.innerText = '';
        qsa('.row button').forEach(e=>e.onclick=letterClicked);
    }, LONG_WAIT);
}

function updateText() {
    text.style.fontSize = Math.min(30 * 10 / (text.innerText.length), 30) + 'pt';

    for(let i=0, len = text.children.length; i<len; i++) {
        const letterSpan = text.children[i],
            letter = letterSpan.innerText;
        
        if( (i == len - 1 && letter.match(RGX_END_NORMAL) && len >= 2)
        || (i < len - 1 && letter.match(RGX_END_LAST)) )
            letterSpan.innerText = END_LETTERS_DICT[letter];
    }

    if(text.innerText.length > 20) {
        resetText(MSG_TOO_LONG);
    }
}

document.onkeydown = ev => {
    if(isWaiting && PAUSE_WHILE_MSG) return;
    //console.log(ev.key);
    if(LETTERS.includes(ev.key) || LETTERS.includes(END_LETTERS_DICT[ev.key])) {
        addText(ev.key);
    }
    else if(ev.key == 'Enter') {
        checkWord();
    }
    else if(ev.key == 'Backspace')
        deleteLastLetter();
    else if(ev.key.match(RGX_HEB_LETTER)){
        showPrompt(MSG_INVALID_KEY, MID_WAIT);
    }
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
        if(!word.includes(CENTER_LETTER) && !word.includes(END_LETTERS_DICT[CENTER_LETTER])) {
            resetText(MSG_NO_CENTER);
            return;
        }
        addWord(word);
        scoreText.innerText = Math.floor(scoreText.innerText) + scoreWord(word);
        updateRank();
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

function showPrompt(message, duration=LONG_WAIT) {
    promptBar.innerText = message;
    promptBar.classList.toggle('hide');
    isWaiting = true;
    setTimeout(()=>{
        promptBar.classList.toggle('hide');
        isWaiting = false;
    }, duration);
}

function addWord(word) {
    if(!usedWords[word.length])
        usedWords[word.length] = [];
    usedWords[word.length].push(word);
    updateTable();
}

function updateTable() {
    table.innerHTML = '';
    const firstRow = make('tr');
    for(const len in usedWords) {
        const th = make('th');
        th.innerText = len;
        firstRow.insertBefore(th, firstRow.children[0]);
    }
    table.appendChild(firstRow);

    let x=0;
    while(true) {
        const tr = make('tr');
        let shouldStop = true;
        for(const len in usedWords) {
            const td = make('td');
            if(usedWords[len][x]) {
                td.innerText = usedWords[len][x];
                /*hr = make('hr');
                hr.style.padding = '0px';
                tr.insertBefore(hr, tr.children[0]);*/
                shouldStop = false;
            }
            tr.insertBefore(td, tr.children[0]);
        }
        table.appendChild(tr);
        if(shouldStop) break;
        x++;
    }
}

function scoreWord(word) {
    return word.length == MIN_LENGTH ? 1 : word.length;
}

function updateRank() {
    const score = Math.floor(scoreText.innerText);
    let maxRank = null;
    for(const rank of RANKS) {
        if(score >= Math.floor(rank.minScore)) {
            rank.html.dot.classList.add('completed');
            rank.html.dot.classList.remove('current');
            rank.html.word.classList.remove('current');
            maxRank = rank;
        }
    }

    if(maxRank) {
        maxRank.html.dot.classList.add('current');
        maxRank.html.word.classList.add('current');
    }
}