const fs = require('fs');
const READ_ADDRESS = './ranks.txt';
const WRITE_ADDRESS = '../ranks.js';

// [titlesListString, minScoresListString]
const data = fs.readFileSync(READ_ADDRESS, 'utf-8').split('\r\n\r\n');

const titles = data[0].split('\r\n'),
    minScores = data[1].split('\r\n'),
    RANKS = [];


for(let i=0; i<titles.length; i++) {
    RANKS.push({
        title: titles[i],
        minScore: minScores[i]
    });
}

fs.writeFileSync(WRITE_ADDRESS, 'const RANKS = ' + JSON.stringify(RANKS) + ';');