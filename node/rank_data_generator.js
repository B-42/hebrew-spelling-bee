const fs = require('fs');
const READ_ADDRESS = './ranks.txt';
const WRITE_ADDRESS = '../ranks.js';

const data = fs.readFileSync(READ_ADDRESS, 'utf-8').split('\r\n');

const RANKS = data.map(str => (
    {
        title: str.match(/[^\d]+/)[0],
        minScore: Math.floor( str.match(/\d+/)[0] )
    }
));

fs.writeFileSync(WRITE_ADDRESS, 'const RANKS = ' + JSON.stringify(RANKS) + ';');