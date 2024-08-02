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
		sessionStorage.setItem("now", 0);
		navigate('/purchase/confirm');
	};

	const save = () => {
		console.log('hi')
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
			}
		})
	}

	const changedFunction = (num, value, amount) => {
		let temp = newCart;
		temp[num].quantity = amount;
		setNewCart(temp);
		temp = itemsChanged;
		temp[num] = value;
		setItemsChanged(temp);
		setChanged(temp.some(item=>item===true) || itemsDeleted.some(item=>item===true));
		save();
	}

	const deleteRow = (id, num) => {
		let temp = newCart.slice();
		for(let i = 0;i < newCart.length;++i){
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
		save();
	}

	const retrieveRow = (id, num) => {
		let temp = newCart.slice();
		for(let i = 0;i < newCart.length;++i){
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
		save();
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
		let sum = 0;
		prices.forEach((price, i) => {
			if(!newCart[i].deleted){
				sum += price;
			}
		});
		setTotal(sum);
	}, [prices, newCart])

	
	if(Object.keys(user).length <= 0){return}
	return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		{user.loggedOut?
			<>
			<div className="login-container">
			<h1 className="login-message">You are not logged in</h1>
			<h2 className='login_to_cart'>Please login to view Cart</h2>
			<button onClick={() => {navigate("/login") }} className="button1 margin_top">login</button>
			</div>
			 	</>		 
			:
			<>
			{user.cart.length > 0?
				<>
				<h1>{`You have ${user.cart.length} Items in your Cart:`}</h1>
				<table id='itemWrapper'>
					<tbody>
					{
						user.cart.map((item, index) => <CartItem setPrices={setPrices} index={index} key={item.productId} retrieveFunc={(e) => {retrieveRow(item.productId, index)}} changedFunc={changedFunction} deleteFunc={(e) => {deleteRow(item.productId, index)}} cartItem={item} />)
					}
					</tbody> 
				</table>
				<h3>Your Total is: {currencies[currency].symbol + Math.floor(total*exchangeRates[currency]*100)/100} </h3>
				<div className='cartBtnContainer'>
					<button onClick={() => {navigate('/')}} className='button1'>Continue Shopping</button>
					<button disabled={!newCart.find(e=>!e.deleted)} onClick={buyCart} className='button1'>Buy Items</button>
				</div>
				</>
				:
				<>
				
				<div className="empty-cart-message">
				<h1>You currently Don't Have Any Items in Your Cart</h1>
				<h2 className='cart_no_products'>Try Searching for Products You Like to Add to Your Cart</h2>
				<button onClick={() => {navigate("/") }} className="button1 margin_top">Home</button>
				</div>
					
				</>
			}
			</>
		}
	</div>
}

export default Cart;