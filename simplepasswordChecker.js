//This library is created by Ata Shaikh
//Contact Ata Shaikh - shaikhata666@gmail.com

//SimplePasswordChecker --version 1.0.0

//Check if password contains atleast 1 number
function isPasswordContainingNumbers(password) {
  var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  //Returns true if password contains a number otherwise returns false
  var result = numbers.some((num) => {
    return password.includes(num);
  });
  return result;
}

//Check if password contains atleast 1 symbol

function isPasswordContainingSymbols(password) {
  var symbols = [
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "[",
    "]",
    "+",
    "-",
    "_",
    ".",
    ",",
    "=",
    "/",
    "|",
  ];
  var result = symbols.some((symbol) => {
    return password.includes(symbol);
  });
  return result;
}

//Check if password contains atleast 1 symbol & 1 number and is not shorter that specified length;
function superCheck(password, length) {
  var symbols = [
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "[",
    "]",
    "+",
    "-",
    "/",
    "|",
  ];
  var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var symbolResult = symbols.some((symbol) => {
    return password.includes(symbol);
  });
  var numberResult = numbers.some((num) => {
    return password.includes(num);
  });
  return symbolResult && numberResult && password.length >= length
    ? true
    : false;
}

module.exports = {
  superCheck,
  isPasswordContainingNumbers,
  isPasswordContainingSymbols,
};
