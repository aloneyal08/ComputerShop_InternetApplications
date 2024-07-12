import React, {useContext, useState, useEffect} from 'react'
import {UserContext, MoneyContext} from '../../Contexts';
import {useNavigate} from 'react-router-dom';
import CartItem from './cartItem';
import './cart.css'

const currencies = require('../../currencies.json');

const Cart = () => {
	const {user, setUser} = useContext(UserContext);
	const {currency, exchangeRates} = useContext(MoneyContext);

	const [itemsChanged, setItemsChanged] = useState([]);
	const [itemsDeleted, setItemsDeleted] = useState([]);
	const [changed, setChanged] = useState(false)
	const [newCart, setNewCart] = useState([]);
	const [prices, setPrices] = useState([]);
	const [total, setTotal] = useState(0);

	const navigate = useNavigate();
	
	const buyCart = () => {
		let save = [];
		newCart.forEach((item) => {
			if(!item.deleted){
				save.push(item);
			}
		});
		sessionStorage.setItem("purchase", JSON.stringify(save));
		sessionStorage.setItem("total", total.toString());
		navigate('/purchase/confirm');
		// fetch(`${process.env.REACT_APP_SERVER_URL}/purchase/buy-multiple`, {
		// 	method: 'POST',
		// 	headers: {
		// 	'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify({
		// 		user: user._id,
		// 		list: save
		// 	})
		// }).then((res) => res.json()).then((res) => {
		// 	if(res.error) {
		// 		alert(res.error);
		// 	} else {
		// 		let tempUser = user;
		// 		tempUser.cart = [];
		// 		setUser(tempUser);
		// 		navigate('/');
		// 	}
		// })
	};

	const saveCart = () => {
		if(changed){
			let save = [];
			newCart.forEach((item) => {
				if(!item.deleted){
					save.push(item);
				}
			});
			fetch(`${process.env.REACT_APP_SERVER_URL}/user/update/cart`, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: user.email,
					cart: save
				})
			}).then((res) => res.json()).then((res) => {
				if(res.error) {
				alert(res.error);
				} else {
					let tempUser = user;
					tempUser.cart = save;
					setUser(tempUser);
					navigate('/');
				}
			})
		} else{
			navigate('/')
		}
		
	};

	const getTotal = () =>{
		console.log(newCart);
		console.log(prices)
		let sum = 0;
		prices.forEach((price, i) => {
			if(!newCart[i].deleted){
				sum += price;
			}
		});
		setTotal(sum);
	}

	const changedFunction = (num, value, amount) => {
		let temp = newCart;
		temp[num].quantity = amount;
		setNewCart(temp);
		temp = itemsChanged;
		temp[num] = value;
		setItemsChanged(temp);
		setChanged(temp.some(item=>item===true) || itemsDeleted.some(item=>item===true));
	}

	const deleteRow = (id, num) => {
		for(let i = 0;i < newCart.length;++i){
			let temp = newCart.slice();
			if(temp[i].productId === id){
				temp[i].deleted = true;
				setNewCart(temp);
				temp = itemsDeleted;
				temp[num] = true;
				setItemsDeleted(temp);
				setChanged(true);
				break;
			}
		}
	}

	const retrieveRow = (id, num) => {
		for(let i = 0;i < newCart.length;++i){
			let temp = newCart.slice();
			if(temp[i].productId === id){
				temp[i].deleted = false;
				setNewCart(temp);
				temp = itemsDeleted;
				temp[num] = false;
				setItemsDeleted(temp);
				setChanged(temp.some(item=>item===true) || itemsChanged.some(item=>item===true));
				break;
			}
		}
	}

	useEffect(() => {
		if(user.cart){
			setNewCart(user.cart.map((item)=>{return {productId: item.productId, quantity: item.quantity}}));
			let temp = [];
			user.cart.forEach((e, i) => {
				temp[i] = false;
			});
			setItemsDeleted(temp);
			setItemsChanged(temp);
			setPrices(temp.map(()=>0));
		}
	}, [user]);

	useEffect(() => {
		getTotal();
	}, [prices, newCart])

	
	if(Object.keys(user).length <= 0){return}
	return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		{user.loggedOut?
			<>
			<h1>To View Your Cart Please <a href='/login'>Login</a></h1>
			</>
			:
			<>
			{user.cart.length > 0?
				<>
				<h1>{`You have ${user.cart.length} Items in your Cart:`}</h1>
				<table id='itemWrapper'>
					<tbody>
					{
						user.cart.map((item, index) => <CartItem onLoad={(num) => {let temp = prices.slice();temp[index] = num;setPrices(temp);}} index={index} key={item.productId} retrieveFunc={(e) => {retrieveRow(item.productId, index)}} changedFunc={changedFunction} deleteFunc={(e) => {deleteRow(item.productId, index)}} cartItem={item} />)
					}
					</tbody> 
				</table>
				<h3>Your Total is: {currencies[currency].symbol + Math.floor(total*exchangeRates[currency]*100)/100} </h3>
				<div className='cartBtnContainer'>
					<button onClick={saveCart} className='button1'>Continue Shopping</button>
					<button onClick={buyCart} className='button1'>Buy Items</button>
				</div>
				</>
				:
				<>
				<h1>You currently Don't Have Any Items in Your Cart</h1>
				<h3>Try Searching for Products You Like to Add to Your Cart</h3>
				</>
			}
			</>
		}
	</div>
}

export default Cart;