const MD5 = require("crypto-js/md5");

let days = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
];

let months = ["9", "10", "11", "12"], dates = [];
for (let month of months) {
  for (let day of days) {
    dates.push(month + day.toString() + "2020");
  }
}
dates.unshift("8292020", "8302020", "8312020");

const objlen = 100;

const indices = dates.map(x => dateAlgo(x, objlen));

const count = {};
indices.forEach(x => {
  if (!(x.toString() in count)) {
    count[x.toString()] = 1;
  } else {
    count[x.toString()]++;
  }
});

function dateAlgo(date, arrLen) {
  let hash = MD5(date).words[0];
  return Math.abs(hash) % arrLen;
}

function countMax(obj) {
    let max = 0;
    for (key in obj) {
       if (obj[key] > max) {
           max = obj[key];
       }
    }
    return max;
}

console.log('Number of dates: ' + dates.length);
console.log('Unique indices: ' + Object.keys(count).length);
console.log('% Unique: ' + Math.round( ((Object.keys(count).length) / dates.length) * 100));
console.log('Most repeats: ' + countMax(count));
