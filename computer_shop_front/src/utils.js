export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePhone = (phone) => {
  return String(phone)
  .toLowerCase().match(/\d/g)&&String(phone).length===10;
}

export const validateUsername = (username) => {
  /* 
    Usernames can only have: 
    - Letters (a-z, A-Z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
  */
  const res = /^[a-zA-Z0-9_.]+$/.exec(username);
  const valid = !!res;
  return valid;
}

export const formatPhoneNumber = (n) => {
  return n.replace( /(\d{3})(\d{3})(\d{4})/, '$1-$2-$3' )
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const nFormatter = (num, digits=1) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k " },
    { value: 1e6, symbol: "M " },
    { value: 1e9, symbol: "G " },
    { value: 1e12, symbol: "T " },
    { value: 1e15, symbol: "P " },
    { value: 1e18, symbol: "E " }
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast(item => num >= item.value);
  return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}