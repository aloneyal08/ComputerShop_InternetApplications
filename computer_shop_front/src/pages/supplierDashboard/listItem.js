import React, { useContext } from 'react'
import { MoneyContext } from '../../Contexts'
import {useNavigate} from 'react-router-dom';

const currencies = require('../../currencies.json');

export const ProductListItem = ({product}) => {
  const {exchangeRates, currency} = useContext(MoneyContext);
  const navigate = useNavigate();

  const deleteProduct = async () => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/delete`,{
      method: 'DELETE',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({_id: product._id})
    }).then(()=>{navigate(0)})
  }

  return <tr className='dashboardListItem'>
    <td>
      <img src={product.photo} alt=' ' style={{height: "50px"}}/>
    </td>
    <td >
      {product.name}
    </td>
    <td>
      {product.discount > 0?
      <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
      <p style={{margin: 0}}>{Math.floor(product.price*exchangeRates[currency]*(1-(Number(product.discount)/100))*100)/100}{currencies[currency].symbol}</p>
      <p style={{textDecoration: 'line-through', textAlign: 'right', fontSize: '11px', color: 'rgb(255, 64, 64)', margin: 0}}>{currencies[currency].symbol + Math.round(product.price*exchangeRates[currency]*100)/100}</p>
      </div>
      :
      <p>{Math.floor(product.price*exchangeRates[currency]*100)/100}{currencies[currency].symbol}</p>
      }
    </td>
    <td>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
      <button className='iconButton' style={{display: 'inline-block' ,boxSizing: 'border-box' , fontSize: '26px', textAlign: 'center', width: 'fit-content', height: 'fit-content'}} onClick={()=>{navigate(`/product/${product._id}`)}}>👁</button>
      <button className='iconButton editButton' onClick={()=>{navigate(`/product/${product._id}/edit`)}}/>
      <button className='iconButton deleteButton' onClick={deleteProduct}/>

      </div>
    </td>
  </tr>
}
