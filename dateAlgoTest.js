dates = [5172020, 5182020, 5192020, 5202020, 5212020, 5222020, 5232020, 5242020, 5252020, 5262020, 5272020, 5282020, 5292020, 5302020, 5312020, 6012020, 6022020, 6032020, 6042020, 6052020, 6062020, 6072020, 6082020, 6092020, 6102020, 6112020, 6122020, 6132020, 6142020, 6152020, 6162020, 6172020, 6182020, 6192020, 6202020, 6212020, 6222020, 6232020, 6242020, 6252020, 6262020, 6272020, 6282020, 6292020, 6302020, 7012020, 7022020, 7032020, 7042020, 7052020, 7062020, 7072020, 7082020, 7092020, 7102020, 7112020, 7122020, 7132020, 7142020, 7152020, 7162020, 7172020];

objlen = 53;

indexes = dates.map(x => dateAlgo(x, objlen));

function dateAlgo(date, arrLen) {
    if (date.toString().length === 7) {
        return Math.abs( ( (date % arrLen) + parseInt(date.toString().slice(0,3)) ) % arrLen );
    } else {
        return Math.abs( ( (date % arrLen) + parseInt(date.toString().slice(1,4)) ) % arrLen );
    }
}

count = {};
indexes.forEach(x => {
    console.log(x);
    if (!(x.toString() in count)) {
        count[x.toString()] = 1;
    } else {
        count[x.toString()]++;
    }
});

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
