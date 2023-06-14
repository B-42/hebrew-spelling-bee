const fs = require('fs');
const READ_ADDRESS = './all_no_fatverb.txt';
const WRITE_ADDRESS = '../words.js';

const words = fs.readFileSync(READ_ADDRESS, 'utf-8').split('\n');
const newWords = {};

console.log('starting ...');

for(const word of words) {
    if(word.match(/"/g)) continue;
    if(!newWords[word[0]]) newWords[word[0]] = [];
    newWords[word[0]].push(word);
}

console.log(words.length + ' words read.\nwriting ...');

fs.writeFileSync(WRITE_ADDRESS, 'const dictionary = ' + JSON.stringify(newWords) + ';');

console.log('done!');