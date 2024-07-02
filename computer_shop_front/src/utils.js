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
