import React, {useState, useEffect, useContext} from 'react';
import {MoneyContext} from '../../Contexts';
import {useNavigate} from 'react-router-dom';

const currencies = require('../../currencies.json');

const CartItem = ({cartItem, index, onLoad = () => {},  changedFunc = () => {}, deleteFunc = () => {}, retrieveFunc = () => {}}) => {
	const {currency, exchangeRates} = useContext(MoneyContext); 

	const [amount, setAmount] = useState(cartItem.quantity);
	const [deleted, setDeleted] = useState(false);
	const [product, setProduct] = useState({});

	const navigate = useNavigate();

	const changeQuantity = (e) => {
		console.log(1)
		e.value = Math.max(1, Math.min(e.value, product.stock));
		setAmount(e.value);
		changedFunc(index, e.value !== cartItem.quantity, e.value)
	}

	const addQuantity = (e, num) => {
		let input = e.currentTarget.parentElement.children[1];
		input.value = Number(input.value) + num;
		changeQuantity(input);
	}

	const deleteItem = (e) => {
		e.stopPropagation()
		setDeleted(true);
		deleteFunc();
	};

	const retrieveItem = (e) => {
		e.stopPropagation()
		setDeleted(false);
		retrieveFunc(index);
	}


	useEffect(()=>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-id`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({id: cartItem.productId})
		}).then((res)=>res.json()).then(res=>setProduct(res));
	}, [cartItem.productId])

	useEffect(()=>{
		if(product.price){
			onLoad(amount*product.price);
		}
	}, [amount, product.price])

	if(Object.keys(cartItem).length <= 0){return;}
	return <tr onClick={()=>navigate(`/product/${product._id}`)} onLoad={(e) => {changeQuantity(e.currentTarget.children[3].children[0].children[1])}} className={`cartItemContainer ${deleted?'deleted':''}`}>
		<td className='cartItemTd'><button onClick={deleted?retrieveItem:deleteItem} className={`cartItemDelete ${deleted?'deleted':''}`}>{deleted?'⟳':'✕'}</button></td>
		<td className='cartItemTd'><img className='cartItemImg' src={product.photo} /></td>
		<td className='cartItemTd'><h2 className='cartItemName' style={{textDecoration: deleted?'line-through':'none'}}>{product.name}</h2></td>
		<td onClick={(e)=>e.stopPropagation()} className='cartItemTd'><div className='cartItemQuantityWrapper'>
			<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, -1)}>-</button>
			{deleted?
				<p>{amount}</p>
				:
				<input value={amount} onChange={(e)=>changeQuantity(e.currentTarget)} />
			}
			<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, 1)}>+</button>
		</div></td>
		<td className='cartItemTd'><h2 className='cartItemPrice'>{currencies[currency].symbol + Math.floor(product.price*amount*exchangeRates[currency]*100)/100}</h2></td>
	</tr>
  }
  
  export default CartItem;