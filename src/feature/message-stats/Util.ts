function sortObjectKeys(obj: { [key: string]: number; }, reverse: boolean = false, limit: number | undefined = undefined) {
  let sorted: any[] = Object.keys(obj);

  if (reverse) {
    // descending
    sorted.sort((a, b) => {
      return obj[b] - obj[a];
    });
  }
  else {
    // ascending
    sorted.sort((a, b) => {
      return obj[a] - obj[b];
    });
  }

  if (typeof (limit) === 'number') {
    sorted = sorted.slice(0, limit);
  }

  return sorted;
}

// https://stackoverflow.com/a/53660837
function getMedian(numbers: number[]): number {
  if (numbers.length === 0 || numbers === null || numbers === undefined) return 0;
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

// https://stackoverflow.com/a/53577159
function getStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0 || numbers === null || numbers === undefined) return 0;
  const n = numbers.length;
  const mean = numbers.reduce((a, b) => a + b) / n;
  return Math.sqrt(numbers.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function bench(callback: Function, ...args: any[]): any {
  let tStart: Date = new Date();
  let res = callback(...args);
  let tEnd: Date = new Date();
  console.log(`Bench [${callback.name}] Start: ${tStart.toUTCString()}, End: ${tEnd.toUTCString()}, Duration: ${tEnd.valueOf() - tStart.valueOf()}ms`);
  return res;
}

function genHexString(len: number) {
  const hex = '0123456789abcdef';
  let output = '';
  for (let i = 0; i < len; ++i) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

let m = {
  sortObjectKeys: sortObjectKeys,
  getMedian: getMedian,
  getStandardDeviation: getStandardDeviation,
  bench: bench,
  genHexString: genHexString
};

export default m;