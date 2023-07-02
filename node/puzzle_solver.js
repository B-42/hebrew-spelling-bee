const RGX_POSSESIVES = /(י?(((ה|כ)[םן]?)|יך?|ך|נו|ו)|ם|ן|ת)$/g,
READ_ADDRESS = './all_no_fatverb.txt',
fs = require('fs'),
words = fs.readFileSync(READ_ADDRESS).toString().split('\n'),
puzzleWords = [],
getLetters = word => word.split('').filter((e,i,arr)=>i==arr.indexOf(e));

for(const word of words) {
    if(getLetters(word).length==7)
        puzzleWords.push(word);
}

console.log(puzzleWords.length + " puzzle words found.");
console.log(puzzleWords);