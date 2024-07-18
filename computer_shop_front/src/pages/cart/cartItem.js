import React, {useState, useEffect, useContext} from 'react';
import {MoneyContext} from '../../Contexts';
import {useNavigate} from 'react-router-dom';
import { emptyProduct as ep } from '../../utils';

const currencies = require('../../currencies.json');
const emptyProduct = {...ep, name: "Product Not Available"}

const CartItem = ({cartItem, index, setPrices = () => {},  changedFunc = () => {}, deleteFunc = () => {}, retrieveFunc = () => {}}) => {
	const {currency, exchangeRates} = useContext(MoneyContext); 

	const [amount, setAmount] = useState(cartItem.quantity);
	const [deleted, setDeleted] = useState(false);
	const [product, setProduct] = useState({});

	const navigate = useNavigate();

	const changeQuantity = (e) => {
		setAmount(Math.max(1, Math.min(e.value, product.stock)));
		changedFunc(index, e.value !== cartItem.quantity, e.value)
	}

	const addQuantity = (e, num) => {
		let input = e.currentTarget.parentElement.children[1];
		input.value = Math.max(1, Math.min(Number(input.value) + num, product.stock));
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
		}).then((res)=>res.json()).then(res=>{
			if(res.error) {
				setProduct(emptyProduct);
				deleteFunc();
				return;
			}
			setProduct(res);
		});
	}, [cartItem, cartItem.productId, deleteFunc])

	useEffect(()=>{
		if(product.price && !product.empty){
			setPrices(prev=>prev.map((p,i)=>i===index?amount*product.price:p));
		}
	}, [amount, product.price, setPrices, index, product.empty])

	if(Object.keys(cartItem).length <= 0){return;}
	return <tr onClick={()=>navigate(`/product/${product._id}`)} className={`cartItemContainer ${deleted?'deleted':''}`}>
		<td className='cartItemTd'><button onClick={deleted?retrieveItem:deleteItem} className={`cartItemDelete ${deleted?'deleted':''}`}>{deleted?'⟳':'✕'}</button></td>
		<td className='cartItemTd'><img alt='         ' className='cartItemImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg');}}/></td>
		<td className='cartItemTd'><h2 className='cartItemName' style={{textDecoration: deleted?'line-through':'none'}}>{product.name}</h2></td>
		<td onClick={(e)=>e.stopPropagation()} className='cartItemTd'><div className='cartItemQuantityWrapper'>
			{!product.empty&&<>
				<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, -1)}>-</button>
				{deleted?
					<p>{amount}</p>
					:
					<input value={amount} onChange={(e)=>changeQuantity(e.currentTarget)} />
				}
				<button disabled={deleted} className='button1' onClick={(e) => addQuantity(e, 1)}>+</button>
			</>}
		</div></td>
		{!product.empty&&<td className='cartItemTd'><h2 className='cartItemPrice'>{currencies[currency].symbol + Math.floor(product.price*amount*exchangeRates[currency]*100)/100}</h2></td>}
	</tr>
  }
  
  export default CartItem;