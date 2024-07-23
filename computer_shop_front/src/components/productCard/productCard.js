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
		}).then((res)=>res.json()).then((res)=>{setProductRate(res);
		});
	}
	}, [product, renderRating]);

    return <div className='productCard' onClick={isClickable?() => {navigate(`/product/${product._id}`)}:undefined}>
    {product.discount?
      <div className='discountLabel'>{product.discount}%</div>
      :
      <></>
    }
    <img alt='           ' className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg');onImageError(e);}}/>
    <div className='productText'>
      <section className='productTextLeft'>
        <div className='productMainCon'>
          <h3 className='productName'>{product.name}</h3>
          {product.discount > 0?
            <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
            <h4 className='productPrice'>{isNaN(product.price)?product.price:currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*(1-(Number(product.discount)/100))*100)/100}</h4>
            <p style={{textDecoration: 'line-through', textAlign: 'right', fontSize: '11px', color: 'rgb(255, 64, 64)', margin: 0}}>{currencies[currency].symbol + Math.round(product.price*exchangeRates[currency]*100)/100}</p>
            </div>
            :
              <h4 className='productPrice'>{isNaN(product.price)?product.price:currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h4>
          }
        </div>
        <aside><h6 className='productSupplier' >{supplier}</h6></aside>
          { renderStock?
            <h4 className={`productStock ${product.stock >= 1?'hidden':'visible'}`}>Currently None in Stock*</h4>
            :
            null
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
          null
        }
      </section>
    </div>
  </div>
  };