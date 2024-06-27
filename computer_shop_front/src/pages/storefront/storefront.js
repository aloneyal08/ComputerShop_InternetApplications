import React, {useContext, useEffect, useState, useRef} from 'react';
import {getFullNameById, getProductRating} from '../../utils'
import {MoneyContext} from '../../Contexts'
import { Rating } from 'react-simple-star-rating'
import './storefront.css';

const currencies = require('../../currencies.json');

const Storefront = () => {
  const {currency, exchangeRates} = useContext(MoneyContext);
  const [recProducts, setRecProducts] = useState([]);
  const [popProducts, setPopProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [recSupplier, setRecSupplier] = useState([]);

  const moveSide = (e, side) =>{
    e.currentTarget.parentElement.scrollBy(1950*side, 0);
  };

  useEffect(() => {
    fetch('http://localhost:88/product/get').then((res)=>res.json()).then((res) => {setRecProducts(res.slice(0, 50))});
    fetch('http://localhost:88/product/get-popular').then((res)=>res.json()).then((res) => {setPopProducts(res.slice(0, 50))});
    fetch('http://localhost:88/product/get-new').then((res)=>res.json()).then((res) => {setNewProducts(res.slice(0, 50))});
    fetch('http://localhost:88/user/get-suppliers').then((res)=>res.json()).then((res) => {setRecSupplier(res.slice(0, 50))});
  }, []);

  return <div>
    <h1 id='title'>Welcome To Our Shop</h1>
    <div id='showContainer'>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1'>
        <div className='moveLeft' disabled={false} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </div>
        {recProducts.map((product)=>
        <div className='productCard'>
          <img className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg')}}/>
          <div className='productText'>
            <section className='productTextLeft'>
              <h3 className='productName'>{product.name}</h3>
              <aside><h6 className='productSupplier' >{getFullNameById(product.supplier)}</h6></aside>
              <h4 className='productStock'>{product.stock>=1?"":'Currently None in Stock*' }</h4>
              <Rating
                readonly={true}
                initialValue={getProductRating(product._id)}
                allowFraction={true}
                size={35}
                id='productRating'
              />
            </section>
            <section className='productTextRight'>
              <h4 className='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h4>
            </section>
          </div>
        </div>)}
        <div className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </div>
      </div>
      <h1 className='title'>Popular</h1>
      <div className='itemContainer scrollBar1'>
        <div className='moveLeft' disabled={false} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </div>
      {popProducts.map((product)=>
      <div className='productCard'>
        <img className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg')}}/>
        <div className='productText'>
          <section className='productTextLeft'>
            <h3 className='productName'>{product.name}</h3>
            <aside><h6 className='productSupplier' >{getFullNameById(product.supplier)}</h6></aside>
            <h4 className='productStock'>{product.stock>=1?"":'Currently None in Stock*' }</h4>
            <Rating
              readonly={true}
              initialValue={getProductRating(product._id)}
              allowFraction={true}
              size={35}
              id='productRating'
            />
          </section>
          <section className='productTextRight'>
            <h4 className='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h4>
          </section>
      </div>
     </div>)}
        <div className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </div>
      </div>
      <h1 className='title'>New</h1>
      <div className='itemContainer scrollBar1'>
        <div className='moveLeft' disabled={false} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </div>
      {newProducts.map((product)=>
      <div className='productCard'>
        <img className='productImg' src={product.photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg')}}/>
        <div className='productText'>
          <section className='productTextLeft'>
            <h3 className='productName'>{product.name}</h3>
            <aside><h6 className='productSupplier' >{getFullNameById(product.supplier)}</h6></aside>
            <h4 className='productStock'>{product.stock>=1?"":'Currently None in Stock*' }</h4>
            <Rating
              readonly={true}
              initialValue={getProductRating(product._id)}
              allowFraction={true}
              size={35}
              id='productRating'
            />
          </section>
          <section className='productTextRight'>
            <h4 className='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h4>
          </section>
      </div>
     </div>)}
        <div className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </div>
      </div>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1' style={{marginLeft: '50px'}}>
        <div className='moveLeft' disabled={false} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </div>
      {recSupplier.map((supplier)=>
      <div className='userCard'>
        <img className='userPhoto' src={supplier.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
        <h4>{supplier.fullName}</h4>
      </div>)}
        <div className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </div>
      </div>
    </div>
  </div>
}

export default Storefront;