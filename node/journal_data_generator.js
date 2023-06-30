const fs = require('fs');
const READ_ADDRESS = './journal.txt';
const WRITE_ADDRESS = '../journal.js';

const data = fs.readFileSync(READ_ADDRESS, 'utf-8').split('\n\r\n');

const journal = [];

for(const rawDaily of data) {
    const rawSplit = rawDaily.split('\r\n'),
    entries = {},
    entriesObj = {
        date: rawSplit[0]
    };
    for(let i=1; i<rawSplit.length; i++) {
        const key = rawSplit[i].split(' ')[0],
            entry = rawSplit[i].match(/(?<=.+ ).*/)[0];
        if(!entries[key]) entries[key] = [];
        entries[key].push(entry);
    }
    entriesObj.entries = entries;
    journal.push(entriesObj);
}

fs.writeFileSync(WRITE_ADDRESS, `const JOURNAL = ${JSON.stringify(journal)};`);