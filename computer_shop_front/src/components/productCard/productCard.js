import React, {useContext, useState, useEffect} from 'react';
import { Rating } from 'react-simple-star-rating';
import {MoneyContext} from '../../Contexts'
import './productCard.css'

const currencies = require('../../currencies.json');

export const ProductCard = ({product, renderRating = true, renderStock = true}) =>{
  const {currency, exchangeRates} = useContext(MoneyContext);
  const [supplier, setSupplier] = useState('');
  const [productRate, setProductRate] = useState(0);
  
  useEffect(()=>{
    if(product.supplierName){
      setSupplier(product.supplierName);
    }else{
      fetch('http://localhost:88/user/id-get',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: product.supplier})
    }).then((res)=>res.json()).then((res)=>{setSupplier(res.fullName)});
  }

  if(renderRating && product.rating){
    setProductRate(product.rating)
  }else{
    fetch('http://localhost:88/review/get',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({product: product._id})
    }).then((res)=>res.json()).then((res)=>{
      let rating = 0;
      res.forEach(review => {
        rating += review.rating;
      });
      setProductRate(Math.floor((rating / res.length)*2)/2);
    });
  }
  }, []);

    return <div className='productCard'>
    <img alt='           ' className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg')}}/>
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
          <Rating
          readonly={true}
          initialValue={productRate}
          allowFraction={true}
          size={35}
          id='productRating'
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