"use strict"

const crypto = require("crypto");

// Config
const TargetNumber = 24;
const MaxNumbers = 4;
const MaxDuplicates = 2;
const Numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const Operators = ["+", "-", "*", "/"];

const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const date = new Date().toISOString().split("T")[0];
const hashDate = hash(date);
const numbers = hashDate.replace(/[0a-f]/g, "");
const gameNumbers = numbers.slice(0, MaxNumbers);
const operatorNumbers = numbers.slice(MaxNumbers, MaxNumbers + Operators.length);
console.log(`Game Numbers of day ${date}: ${gameNumbers}`);

const sortOperators = Operators.map((operator, index) => {
  return { val: operator, pos: operatorNumbers[index] };
});
sortOperators.sort((a, b) => {
  return a.pos - b.pos;
});
const sortedOperators = sortOperators.map((operator) => {
  return operator.val;
});

function combination(item, n) {
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
  }
  pow(isArray ? item.length : item, n);
  return filter ? result.filter(item => item.length === n) : result;
}

const numberCombinations = combination(Numbers, MaxNumbers);
console.log("Number combinations: " + numberCombinations.length);
const operatorCombinations = combination(sortedOperators, MaxNumbers - 1);
console.log("Operator combinations : " + operatorCombinations.length);

const result = {};

function uniqueMap(array) {
  return array.reduce((result, entry) => {
    result[entry] = result[entry] || 0;
    result[entry]++;
    return result;
  }, {});
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

for (const numbers of numberCombinations) {
  if (countDuplicates(numbers) > MaxDuplicates) {
    continue;
  }
  const key = [...numbers].sort().join("");
  for (const operators of operatorCombinations) {
    // (1+2)*(3+4)
    const equationOuter = numbers.reduce((line, number, i) => {
      if ([0, 2].includes(i)) {
        line += "(";
      }
      line = line + number;
      if ([1, 3].includes(i)) {
        line += ")";
      }
      if (i < operators.length) {
        line = line + operators[i];
      }
      return line;
    }, "").trim();
    // ((1+2)*3)+4
    const equationInner = numbers.reduce((line, number, i) => {
      if ([0].includes(i)) {
        line += "((";
      }
      line = line + number;
      if ([1,2].includes(i)) {
        line += ")";
      }
      if (i < operators.length) {
        line = line + operators[i];
      }
      return line;
    }, "").trim();
    const equations = [equationOuter, equationInner]
    equations.forEach((equation) => {
      if (eval(equation) === TargetNumber) {
        result[key] = result[key] || [];
        result[key].push(equation);
      }
    });
  }
}

const keys = Object.keys(result).sort((a, b) => {
  return result[a].length - result[b].length;
});
keys.sort();

const values = keys.map((key) => {
  return {
    key,
    value: result[key],
  };
});

console.log("All Solutions: " + values.length);

const gameNumberArray = gameNumbers.split("");
gameNumberArray.sort();
const sortedGameNumbers = gameNumberArray.join("");

const solution = values.find((value) => {
  return value.key === sortedGameNumbers;
});

if (solution) {
  console.log(`Solutions for date ${date} with numbers ${solution.key}: `, solution.value);
  } else {
  console.log(`No solutions for date ${date} with numbers ${solution.key}`);
}