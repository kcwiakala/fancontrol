const lpf = (alpha, x) => value => {
  x = x + (value - x) * alpha;
  return x;
} 

const sma = (length, init) => {
  const vals = new Array(length).fill(init);
  sum = length * init;
  let i = 0;
  return value => {
    i = (i+1) % length;
    sum = sum - vals[i] + value; 
    vals[i] = value;
    return sum / length;
  };
}

exports.makeFilter = opts => {
  opts = opts || {};
  switch (opts.type) {
    case 'LPF':
      return lpf(opts.alpha || 0.5, opts.init || 100);
    case 'SMA': 
      return sma(opts.length || 5, opts.init || 100);
    default:
      return value => value;
  }
}