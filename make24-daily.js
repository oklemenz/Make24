"use strict";

const crypto = require("crypto");

// Config
const TargetNumber = 24;
const MaxNumbers = 4;
const MaxDuplicates = 2;
const Operators = ["+", "-", "*", "/"];
const ShowSolutions = process.argv?.[2] === "show";

(function () {
  let numbers = [];
  let solutions = [];

  const date = new Date().toISOString().split("T")[0];
  const hashDate = hash(date);
  const hashNumbers = hashDate.replace(/[0a-f]/g, "");

  for (let i = 0; i < hashDate.length - MaxNumbers; i++) {
    const numbersString = hashNumbers.slice(i, MaxNumbers + i);
    numbers = numbersString.split("").sort();
    if (countDuplicates(numbers) > MaxDuplicates) {
      continue;
    }
    solutions = makeSolutions(numbers);
    if (solutions.length > 0) {
      break;
    }
  }

  if (numbers.length > 0) {
    console.log(`Game numbers for today (${date}): ${numbers}`);
    if (ShowSolutions) {
      console.log(`Solutions: ${solutions}`);
    }
  } else {
    console.log("No game numbers for today (${date})");
  }
})();

function makeSolutions(numbers) {
  const solutions = [];

  const numberPermutations = permutations(numbers);
  const operatorCombinations = combinations(Operators, MaxNumbers - 1);

  for (const numberPermutation of numberPermutations) {
    for (const operatorCombination of operatorCombinations) {
      // (1+2)*(3+4)
      const equationOuter = numberPermutation
        .reduce((line, number, i) => {
          if ([0, 2].includes(i)) {
            line += "(";
          }
          line = line + number;
          if ([1, 3].includes(i)) {
            line += ")";
          }
          if (i < operatorCombination.length) {
            line = line + operatorCombination[i];
          }
          return line;
        }, "")
        .trim();

      // ((1+2)*3)+4
      const equationInner = numberPermutation
        .reduce((line, number, i) => {
          if ([0].includes(i)) {
            line += "((";
          }
          line = line + number;
          if ([1, 2].includes(i)) {
            line += ")";
          }
          if (i < operatorCombination.length) {
            line = line + operatorCombination[i];
          }
          return line;
        }, "")
        .trim();
      for (const equation of [equationOuter, equationInner]) {
        if (eval(equation) === TargetNumber) {
          solutions.push(equation);
        }
      }
    }
  }

  return solutions;
}

function combinations(item, n) {
  const filter = typeof n !== "undefined";
  n = n ? n : item.length;
  const result = [];
  const isArray = item.constructor.name === "Array";
  const count = isArray ? item.length : item;
  const pow = (x, n, m = []) => {
    if (n > 0) {
      for (var i = 0; i < count; i++) {
        const value = pow(x, n - 1, [...m, isArray ? item[i] : i]);
        result.push(value);
      }
    }
    return m;
  };
  pow(isArray ? item.length : item, n);
  return filter ? result.filter((item) => item.length === n) : result;
}

function permutations(input) {
  const result = [];
  const permute = (array, m = []) => {
    if (array.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < array.length; i++) {
        const current = array.slice();
        const next = current.splice(i, 1);
        permute(current.slice(), m.concat(next));
      }
    }
  };
  permute(input);
  return result;
}

function countDuplicates(array) {
  const map = uniqueMap(array);
  return Object.keys(map).reduce((result, entry) => {
    if (map[entry] === 2) {
      result += 1;
    } else if (map[entry] > 2) {
      result += map[entry];
    }
    return result;
  }, 0);
}

function uniqueMap(array) {
  return array.reduce((result, entry) => {
    result[entry] = result[entry] || 0;
    result[entry]++;
    return result;
  }, {});
}

function hash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
