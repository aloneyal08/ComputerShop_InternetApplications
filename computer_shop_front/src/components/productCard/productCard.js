import React, {useContext, useState, useEffect} from 'react';
import {useNavigate } from "react-router-dom";
import ReactStarsRating from 'react-awesome-stars-rating';
import {MoneyContext} from '../../Contexts'
import './productCard.css'

const currencies = require('../../currencies.json');

export const ProductCard = ({product, renderRating = true, renderStock = true, isClickable=true, onImageError = () => {}}) =>{
  const {currency, exchangeRates} = useContext(MoneyContext);
  const [supplier, setSupplier] = useState(product.supplierName);
  const [productRate, setProductRate] = useState(0);
  const navigate = useNavigate();
  
  useEffect(()=>{
    if(product.supplierName){
      setSupplier(product.supplierName);
    }else{
      fetch(`${process.env.REACT_APP_SERVER_URL}/user/id-get`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: product.supplier})
    }).then((res)=>res.json()).then((res)=>{
      setSupplier(res.fullName);
    });
  }

  if(renderRating && product.rating){
    setProductRate(product.rating)
  }else{
    fetch(`${process.env.REACT_APP_SERVER_URL}/review/get-rating`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({product: product._id})
    }).then((res)=>res.json()).then((res)=>{setProductRate(Math.max(0.5, Math.floor(res*2)/2));
    });
  }
  }, [product, renderRating]);

    return <div className='productCard' onClick={isClickable?() => {navigate(`/product/${product._id}`)}:undefined}>
    <img alt='           ' className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg');onImageError(e);}}/>
    <div className='productText'>
      <section className='productTextLeft'>
        <h3 className='productName'>{product.name}</h3>
        <aside><h6 className='productSupplier' >{supplier}</h6></aside>
          { renderStock?
            <h4 className={`productStock ${product.stock >= 1?'hidden':'visible'}`}>Currently None in Stock*</h4>
            :
            <></>
          }
        { renderRating?
          <ReactStarsRating 
            value={productRate} 
            isEdit={false}
            secondaryColor="#cccccc"
            primaryColor="#ffbc0b"
            size={33}
            id={product._id}
          /> 
          :
          <></>
        }
      </section>
      <section className='productTextRight'>
        <h4 className='productPrice'>{isNaN(product.price)?product.price:currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h4>
      </section>
    </div>
  </div>
  };