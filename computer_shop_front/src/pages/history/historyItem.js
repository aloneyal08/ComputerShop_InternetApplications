import React, {useContext} from 'react';
import {MoneyContext} from '../../Contexts';
import {useNavigate} from 'react-router-dom';
import { emptyProduct as ep } from '../../utils';
import './history.css';

const currencies = require('../../currencies.json');
const emptyProduct = {...ep}

const HistoryItem = ({product,quantity,price}) => {

	const {currency, exchangeRates} = useContext(MoneyContext); 
	const navigate = useNavigate();
  
	if(!product._id) product = {...emptyProduct, ...product};


	if(Object.keys(product).length <= 0) return;
	return <tr className='historyItemContainer' style={!product.empty ? {cursor: "pointer"} : {}}
		onClick={!product.empty ? ()=>navigate(`/product/${product._id}`) : null}>
		<td className='historyItemTd'><img alt='         ' className='historyItemImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg');}}/></td>
		<td className='historyItemTd'><h2 className='historyItemName'>{product.name}</h2></td>
    <td className='historyItemTd'><p>{quantity}</p></td>
		<td className='historyItemTd'><h2 className='historyItemPrice'>{currencies[currency].symbol + Math.floor(price*exchangeRates[currency]*100)/100}</h2></td>
	</tr>
  }
  
  export default HistoryItem;