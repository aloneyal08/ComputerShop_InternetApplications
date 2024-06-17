import React, { useRef } from 'react'
import './newProduct.css';

const NewProduct = () => {
  const stockIn = useRef(null);
  const priceIn = useRef(null);
  const imgIn = useRef(null);

  return <div>
    <div id='newProductContainer'>
      <h1 id='title'>Add New Product</h1>
      <div id='inputContainer'>
        <div id='photoInContainer'>
          <label id='photoLa' htmlFor='photoIn'>Product Photo</label>
          <img src='' id='productImg' ref={imgIn}></img>
          <input id='photoIn' required={true} type='text' placeholder='Photo URL' onKeyUp={(e) => {imgIn.current.src = e?e.currentTarget.value:''}}></input>
        </div>
        <div id='textInContainer'>
          <label id='nameLa' htmlFor='nameIn'>Product Name</label>
          <input id='nameIn' required={true} type='text' placeholder='New Product'></input>
          <label id='descLa' htmlFor='descIn'>Product Description</label>
          <textarea id='descIn' rows={5} placeholder='Product Description'></textarea>
          <div id='numbersContainer'>
            <div id='stockContainer' className='numContainer'>
              <label id='stockLa' htmlFor='stockIn'>Starting Stock</label>
              <div className='numFuncContainer' id='stockFuncContainer'>
                <button id='stockMinus' onClick={() => {stockIn.current.value = stockIn.current.value > 1?stockIn.current.value - 1:1}}>-</button>
                <input id='stockIn' required={true} type='number' ref={stockIn} step={1} min={1} placeholder='1'></input>
                <button id='stockPlus' onClick={() => {stockIn.current.value = stockIn.current.value?Number(stockIn.current.value) + 1:1}}>+</button>
              </div>
            </div>
            <div id='priceContainer' className='numContainer'>
              <label id='priceLa' htmlFor='priceIn'>Price</label>
              <div className='numFuncContainer' id='priceFuncContainer'>
                <button id='priceMinus' onClick={() => {priceIn.current.value = priceIn.current.value?(priceIn.current.value > 10? Math.round((priceIn.current.value - 100)*100)/10:0.01):100}}>-</button>
                <input id='priceIn' required={true} type='number' ref={priceIn} step={0.01} min={0.01} placeholder='100'></input>
                <button id='pricePlus' onClick={() => {priceIn.current.value = priceIn.current.value?Math.round((Number(priceIn.current.value) + 10)*100)/100:100}}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default NewProduct;