const make = str => document.createElement(str),
get = id => document.getElementById(id),
qs = str => document.querySelector(str),
qsa = str => document.querySelectorAll(str),
range = len => 'a'.repeat(len).split('').map((e,i)=>i),
shuffle = arr => arr.sort((a,b)=>Math.floor(Math.random()*2) - 1),
randItem = arr => arr[Math.floor(Math.random() * arr.length)],
bounds = el => el.getBoundingClientRect(),
isDateBeforeToday = date => {
    return !date || new Date(date.toDateString()) < new Date(new Date().toDateString());
},
getUniqueLetters = word => word.split('').filter((e,i,arr) => i == arr.indexOf(e))