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

export const getRandomColor = () => {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}


const getColorNum1 = (str) => {
	var sum = 0;
	for (var i = 0; i < str.length; i++) {
		sum += str.charCodeAt(i);
	}

	return 90 + sum % 165;
}

const getColorNum2 = (str) => {
	var sum = 1;
	for (var i = 0; i < str.length; i++) {
		sum *= str.charCodeAt(i);
	}

	return 90 + sum % 165;
}

const getColorBrightness = (R,B,G) => {
	return (0.2126*R + 0.7152*G + 0.0722*B)/256;
}

export const getColorById = (id) => {
	if(!id)
		return 'white'
	const redStr = id.slice(0,8);
	const greenStr = id.slice(8,16);
	const blueStr = id.slice(16,24);

	var i = 1;
	var red = 0, green = 0, blue = 0;
	while(getColorBrightness(red,green,blue) < 0.5 || getColorBrightness(red,green,blue) > 0.8){
		red = (getColorNum1(redStr) + i*getColorNum2(redStr))%256;
		green = (getColorNum1(greenStr) + i*getColorNum2(greenStr))%256;
		blue = (getColorNum1(blueStr) + i*getColorNum2(blueStr))%256;
		i++;
	}

	return `rgb(${red},${green},${blue})`;
}