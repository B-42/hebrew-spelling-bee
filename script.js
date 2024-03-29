const MIN_LENGTH = 4,
MAX_LENGTH = 20,
LONG_WAIT = 1000,
MID_WAIT = 750,
SHORT_WAIT = 500,
MICRO_WAIT = 100,
CENTER_INDEX = 3,
MSG_TOO_LONG = 'ארוך מדי',
MSG_TOO_SHORT = 'קצר מדי',
MSG_VALID = '!נכון',
MSG_INVALID = 'לא במילון',
MSG_INVALID_KEY = 'לא במחסן האותיות',
MSG_USED_WORD = 'השתמשת כבר במילה זו',
MSG_PANGRAM = '!פנגרם',
MSG_POSSESSIVES = 'בלי סיומות שייכות',
usedWords = {}, history = [],
RGX_HEB_LETTER = /[א-ת]/,
RGX_END_NORMAL = /[מנצפכ]/,
RGX_END_LAST = /[םןץףך]/,
RGX_POSSESSIVES = /(י?(((ה|כ)[םן]?)|יך?|ך|נו|ו)|ם|ן|ת)$/g,
END_LETTER_PAIRS = [
    'מם', 'נן', 'צץ', 'פף', 'כך'
],
END_LETTERS_DICT = generateEndDict(),
LETTERS = generatePuzzle()
PAUSE_WHILE_MSG = false,
LAST_DATE_KEY = 'lastDate',
ADMIN_HASH = 6421009277200913;

function generatePuzzle() {
    while(!dictionary) {console.log('a')}
    let letters = [];
    const alphabet = Object.keys(dictionary);
    do {
        let word = randItem( dictionary[randItem(alphabet)] );
        /*if(word.match(RGX_POSSESIVES))
            continue;*/
        letters = getUniqueLetters( replaceEndLetters( formatWord( word ) ) );
        history.push(word);
    } while(letters.length != 7);
    return letters;
}

function showHistory() {
    console.log(history);
}

const CENTER_LETTER = LETTERS[CENTER_INDEX],
MSG_NO_CENTER = 'נחשו מילה עם ' + "<strong class='big'>"+CENTER_LETTER+"</strong>";
usedSpan.innerText = CENTER_LETTER,
{solutions, maxScore} = solvePuzzle();
surrenderButton.onclick = ev => {
    surrenderText.innerText = randItem(solutions);
}

function generateEndDict() {
    const dict = {};
    for(const pair of END_LETTER_PAIRS) {
        dict[pair[0]] = pair[1];
        dict[pair[1]] = pair[0];
    }
    return dict;
}

function replaceEndLetters(word) {
    return word.split('').map(
        letter => letter.match(RGX_END_LAST) ? END_LETTERS_DICT[letter] : letter
    ).join('');
}

let isWaiting = false,
numUsedWords = 0;

shuffleLetters();

if(/*true || */isDateBeforeToday( new Date(localStorage.getItem(LAST_DATE_KEY)) )) {
    welcomeDialog.showModal();
}
localStorage.setItem(LAST_DATE_KEY, new Date().toString());

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
        button.onclick = ev => buttonClick(ev, () => addText(button.innerText));
        row.appendChild(button);
        x++;
    }
    
    beehive.appendChild(row);
}

for(const rank of RANKS) {
    const rankDot = make('div');
    //rankDot.innerText = BULLET;
    rankDot.classList.add('rankdot');

    //rankDots.insertBefore(rankDot, rankDots.children[0]);
    //rankWords.appendChild(rankWord);
    rankContainer.insertBefore(rankDot, rankContainer.children[0]);

    rank.html = {dot: rankDot};
}
updateRank();


minButton.onclick = minimize;

dialogButton.onclick = ev => buttonClick(ev, () => welcomeDialog.showModal());

if(window.innerWidth <= 750)
    minimize();

function buttonClick(ev, func) {
    //ev.target.classList.toggle('clicked');
    ev.target.blur();
    //setTimeout(()=>ev.target.classList.toggle('clicked'), SHORT_WAIT);
    func();
}

function minimize() {
    minButton.blur();
    minButton.classList.toggle('clicked');
    usedContainer.classList.toggle('minimized');
    scoreContainer.classList.toggle('minimized');
    stats.classList.toggle('minimized');
    qsa('.rankword').forEach(wordElm => wordElm.classList.toggle('minimized'));
}

function addText(str) {
    const letterSpan = make('span');
    letterSpan.innerText = str;
    const children = [...text.children];
    letterSpan.onclick = ev => moveTabToNode(letterSpan, true);
    if(str == CENTER_LETTER) letterSpan.classList.add('centerLetter');
    text.insertBefore(letterSpan, tab);
    updateText();
}

/*function deleteLastLetter() {
    text.removeChild(text.children[text.children.length - 1]);
    updateText();
}*/

function backspace() {
    if(text.children.length == 1) return -1;

    for(let i=1; i<text.children.length; i++) {
        if(text.children[i] == tab) {
            text.removeChild(text.children[i-1]);
            updateText();
            return i-1;
        }
    }
    
    return -1;
}

function shuffleLetters() {
    do {
        shuffle(LETTERS);
    } while(LETTERS[CENTER_INDEX] != CENTER_LETTER);
}

function updateButtons(duration=LONG_WAIT) {
    for(const i of range(7)) {
        const button = get('button' + (i+1));
        button.style.animation = `fade-out-in ${duration/1000}s ease-out`;
        setTimeout(() => {
            button.innerText = LETTERS[i];
        }, duration/2);
        setTimeout(() => {
            button.style.animation = `none`;
        }, duration + 1);
    }
}

function resetText(message, duration = LONG_WAIT, classes='') {
    //qsa('.row button').forEach(e=>e.onclick=null);
    if(message) showPrompt(message, duration, classes);
    setTimeout(() => {
        for(let i=text.children.length - 1; i >= 0; i--)
            if(text.children[i] != tab)
                text.removeChild(text.children[i]);
        //qsa('.row button').forEach(e=>e.onclick=letterClicked);
    }, SHORT_WAIT);
}

function updateText() {
    text.style.fontSize = Math.min(30 * 10 / (text.innerText.length), 30) + 'pt';

    for(let i=0, len = text.children.length; i<len; i++) {
        const letterSpan = text.children[i],
            letter = letterSpan.innerText;
        
        if( ( (i == len - 1 || i == len - 2 && text.children[len-1] == tab) && letter.match(RGX_END_NORMAL) && len >= 3)
        || (i < len - 1 && letter.match(RGX_END_LAST)) )
            letterSpan.innerText = END_LETTERS_DICT[letter];
    }

    if(text.innerText.length > 20) {
        resetText(MSG_TOO_LONG);
    }
}

function moveTab(steps) {
    const tabIndex = [...text.children].indexOf(tab),
        newIndex = tabIndex + steps;
    if(newIndex < 0 || newIndex >= text.children.length)
        return false;
    
    const tabClone = tab.cloneNode(true), child = text.children[newIndex];
    text.removeChild(tab);
    text.insertBefore(tabClone, steps < 0 ? child : child.nextSibling);
    return true;
}

function moveTabToNode(node, after=false) {
    const tabClone = tab.cloneNode(true);
    text.removeChild(tab);
    text.insertBefore(tabClone, after ? node.nextSibling : node);
}

document.onkeydown = ev => {
    if(isWaiting && PAUSE_WHILE_MSG) return;

    if(LETTERS.includes(ev.key) || LETTERS.includes(END_LETTERS_DICT[ev.key])) {
        addText(ev.key);
        return;
    } else if(ev.key.match(RGX_HEB_LETTER)){
        showPrompt(MSG_INVALID_KEY, MID_WAIT);
        return;
    }

    switch(ev.key) {
        case 'Enter': checkWord(); break;
        case 'Backspace': backspace(); break;
        case 'ArrowLeft': moveTab(1); break;
        case 'ArrowRight': moveTab(-1); break;
        //default: console.log(ev.key);
    }
}

document.ondblclick = ev => ev.preventDefault();

deleteButton.onclick = ev => buttonClick(ev, backspace);
shuffleButton.onclick = ev => buttonClick(ev, () => {shuffleLetters(); updateButtons(MID_WAIT);});
enterButton.onclick = ev => buttonClick(ev, checkWord);

function wordIsValid(word) {
    return dictionary[word[0]].includes(word);
}

function checkWord() {
    const word = formatWord( text.innerText );

    if(word.length < MIN_LENGTH) {
        resetText(MSG_TOO_SHORT);
        return;
    }

    const isValid = wordIsValid(word);

    if(isValid) {
        if(!word.includes(CENTER_LETTER) && !word.includes(END_LETTERS_DICT[CENTER_LETTER])) {
            resetText(MSG_NO_CENTER);
            return;
        }
        if(usedWords[word.length] && usedWords[word.length].includes(word)) {
            resetText(MSG_USED_WORD);
            return;
        }
        /*if(word.match(RGX_POSSESSIVES)) {
            resetText(MSG_POSSESSIVES);
            return;
        }*/
        addWord(word);
        scoreText.innerText = Math.floor(scoreText.innerText) + scoreWord(word);
        updateRank();
        if(isPangram(word)) {
            resetText(MSG_PANGRAM, MID_WAIT, 'golden big bold');
            return;
        }
    }
    
    resetText(isValid ? MSG_VALID : MSG_INVALID, isValid ? SHORT_WAIT : LONG_WAIT, isValid ? 'golden' : '');
}

function removeNiqqud(word) {
    // Remove all characters that are classified as Niqqud
    var withoutNiqqud = word.replace(/[\u0591-\u05C7]/g, '');
    return withoutNiqqud;
}

function formatWord(word){
    return word.replace(/[^א-ת]/g,"");
}

function showPrompt(message, duration=LONG_WAIT, classes='') {
    promptBar.innerHTML = message;
    promptBar.classList.toggle('hide');
    classes = classes.split(' ').filter(e=>e.length);
    if(classes.length)
        classes.forEach(classname => promptBar.classList.toggle(classname));
    isWaiting = true;
    setTimeout(()=>{
        promptBar.classList.toggle('hide');
        if(classes.length)
            classes.forEach(classname => promptBar.classList.toggle(classname));
        isWaiting = false;
    }, duration);
}

function addWord(word) {
    //usedTitle.classList.remove('minimized');

    if(!usedWords[word.length])
        usedWords[word.length] = [];

    usedWords[word.length].push(word);
    numUsedWords++;
    usedCounter.innerText = numUsedWords;
    updateTable();
}

function updateTable() {
    table.innerHTML = '';
    const firstRow = make('tr');
    for(const len in usedWords) {
        const th = make('th');
        th.innerText = len;
        //firstRow.insertBefore(th, firstRow.children[0]);
        firstRow.appendChild(th);
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
            //tr.insertBefore(td, tr.children[0]);
            tr.appendChild(td);
        }
        table.appendChild(tr);
        if(shouldStop) break;
        x++;
    }
}

function scoreWord(word) {
    const points = word.length == MIN_LENGTH ? 1 : word.length,
        bonusPoints = isPangram(word) ? 7 : 0;
    return points + bonusPoints;
}

function isPangram(word) {
    word = replaceEndLetters(word);
    return LETTERS.every(letter=>word.includes(letter));
}

function updateRank() {
    const score = Math.floor(scoreText.innerText);
    let maxRank = null;
    for(const rank of RANKS) {
        if(score >= Math.floor(rank.minScore)) {
            rank.html.dot.classList.add('completed');
            rank.html.dot.innerText = '';
            rank.html.dot.classList.remove('current');
            maxRank = rank;
        }
    }

    if(maxRank) {
        maxRank.html.dot.classList.add('current');
        maxRank.html.dot.innerText = score;
        rankTitle.innerText = maxRank.title;
    }

    updateRankLine(); setTimeout(updateRankLine, SHORT_WAIT);
}

function updateRankLine() {
    const dot1 = RANKS[0].html.dot,
        dot0 = RANKS[RANKS.length-1].html.dot,
        bounds1 = bounds(dot1),
        bounds0 = bounds(dot0),
        x0 = bounds0.x + bounds0.width / 2,
        x1 = bounds1.x + bounds1.width / 2;
    rankLine.style.width = x1 - x0 + 'px';
    rankLine.style.left = dot0.offsetLeft + dot0.offsetWidth/2 + dot0.offsetParent.offsetLeft + "px";
}

function solvePuzzle() {
    const solutions = [];
    for(const letter in dictionary) {
        for(const word of dictionary[letter]) {
            if(word.length >= MIN_LENGTH
                && word.includes(CENTER_LETTER)
                /*&& !word.match(RGX_POSSESSIVES)*/
                && word.split('').every(ltr=>LETTERS.includes(ltr)))
                solutions.push(word);
        }
    }
    return {solutions, maxScore: solutions.map(scoreWord).reduce((a,b)=>a+b)};
}

function isPasswordValid(password) {
    return cyrb53a(
        password.substring(0, password.length - 3),
        Math.floor( password.substring(password.length - 3) )
    ) == ADMIN_HASH;
}

function consoleExecute() {
    if(!isPasswordValid(pass.value))
        return;
    try {
        consoleOutput.innerText = eval(consoleInput.value);
    } catch(e) {
        consoleOutput.innerText = e;
    }
}

consoleButton.onclick = ev => {
    ev.preventDefault(); consoleExecute();
}
consoleClear.onclick = ev => {
    ev.preventDefault(); consoleInput.value = '';
}