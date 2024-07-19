import React, { useContext } from 'react'
import { MoneyContext } from '../../Contexts'
import {useNavigate} from 'react-router-dom';

const currencies = require('../../currencies.json');

export const ProductListItem = ({product}) => {
  const {exchangeRates, currency} = useContext(MoneyContext);
  const navigate = useNavigate();

  return <tr className='dashboardListItem'>
    <td>
      <img src={product.photo} alt=' ' style={{height: "50px"}}/>
    </td>
    <td >
      {product.name}
    </td>
    <td>
      {Math.floor(product.price*exchangeRates[currency]*100)/100}{currencies[currency].symbol}
    </td>
    <td>
      <button className='iconButton editButton' onClick={()=>{navigate(`/product/${product._id}/edit`)}}/>
    </td>
  </tr>
}
