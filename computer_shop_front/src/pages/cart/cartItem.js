import React, {useState, useEffect, useContext} from 'react';
import {MoneyContext} from '../../Contexts';

const currencies = require('../../currencies.json');

const CartItem = ({cartItem, index, changedFunc = () => {}, deleteFunc = () => {}, retrieveFunc = () => {}}) => {
	const {currency, exchangeRates} = useContext(MoneyContext); 

	const [amount, setAmount] = useState(cartItem.quantity);
	const [deleted, setDeleted] = useState(false);
	const [product, setProduct] = useState({});

	const changeQuantity = (e) => {
		e.value = Math.max(1, Math.min(e.value, product.stock));
		setAmount(e.value);
		changedFunc(index, e.value !== cartItem.quantity, e.value)
	}

	const addQuantity = (e, num) => {
		let input = e.currentTarget.parentElement.children[1];
		input.value = Number(input.value) + num;
		changeQuantity(input);
	}

	const deleteItem = () => {
		setDeleted(true);
		deleteFunc();
	};

	const retrieveItem = () => {
		setDeleted(false);
		retrieveFunc(index);
	}

	useEffect(()=>{
		console.log(1)
	}, [cartItem.quantity])

	useEffect(()=>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-id`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({id: cartItem.productId})
		}).then((res)=>res.json()).then(res=>setProduct(res));
	}, [cartItem.productId])

	useEffect(() => {
			console.log(1)
	}, [cartItem])

	if(Object.keys(cartItem).length <= 0){return;}
	return <tr className={`cartItemContainer ${deleted?'deleted':''}`}>
		<td><button onClick={deleted?retrieveItem:deleteItem} className={`cartItemDelete ${deleted?'deleted':''}`}>{deleted?'⟳':'✕'}</button></td>
		<td><img className='cartItemImg' src={product.photo} /></td>
		<td><h2 className='cartItemName' style={{textDecoration: deleted?'line-through':'none'}}>{product.name}</h2></td>
		<td><div className='cartItemQuantityWrapper'>
			<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, -1)}>-</button>
			{deleted?
				<p>{amount}</p>
				:
				<input value={amount} onChange={(e)=>changeQuantity(e.currentTarget)} />
			}
			<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, 1)}>+</button>
		</div></td>
		<td><h2 className='cartItemPrice'>{currencies[currency].symbol + Math.floor(product.price*amount*exchangeRates[currency]*100)/100}</h2></td>
	</tr>
  }
  
  export default CartItem;