import React, {useRef, useEffect, useState} from 'react';
import './storefront.css';
import { FlashContainer } from './flashContainer';
import {ProductCard} from '../../components/productCard/productCard';

const Storefront = () => {
  const [recProducts, setRecProducts] = useState([]);
  const [popProducts, setPopProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [recSupplier, setRecSupplier] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);
  const [flashSide, setFlashSide] = useState(1);
  const [flashPos, setFlashPos] = useState(0);
  const [resetDelay, setResetDelay] = useState(false);

  const flashContainers = useRef();

  function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      } else {
        setResetDelay(false);
      }
    }, [delay]);
  }

  const moveFlash = (to = -1) =>{
    if(flashContainers !== null){
      if(flashContainers.current.children.length !== 0){
        let pos = to === -1?flashPos + flashSide:to;
        if(pos === 0){
          setFlashSide(1);
        }
        if(pos === flashContainers.current.children.length - 1){
          setFlashSide(-1);
        }
        flashContainers.current.scroll(pos * (flashContainers.current.children[0].clientWidth + 100), 0);
        setFlashPos(pos);
        setResetDelay(true);
      }
    }
  }

  const moveSide = (e, side) =>{
    const cardWidth = e.currentTarget.parentElement.children[1].clientWidth + 24.8;
    let scrollEnd = Math.max(0, Math.min(e.currentTarget.parentElement.scrollLeft + (cardWidth*5*side), e.currentTarget.parentElement.scrollWidth - e.currentTarget.parentElement.clientWidth));
    scrollEnd = Math.round(scrollEnd/cardWidth)*cardWidth;
    e.currentTarget.parentElement.scroll(scrollEnd, 0);
  };

  const scrollHandle = (e) => {
    let pos = Math.round(e.currentTarget.scrollLeft);
    let limit = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;
    e.currentTarget.children[0].disabled = (pos === 0);
    e.currentTarget.children[e.currentTarget.children.length - 1].disabled = (pos === limit);
  }
  
  useInterval(moveFlash, resetDelay?null:5000)

  useEffect(() => {
    fetch('http://localhost:88/product/get').then((res)=>res.json()).then((res) => {setRecProducts(res.slice(0, 50))});
    fetch('http://localhost:88/product/get-popular').then((res)=>res.json()).then((res) => {setPopProducts(res.slice(0, 50))});
    fetch('http://localhost:88/product/get-new').then((res)=>res.json()).then((res) => {setNewProducts(res.slice(0, 50))});
    fetch('http://localhost:88/user/get-suppliers').then((res)=>res.json()).then((res) => {setRecSupplier(res.slice(0, 50))});
    fetch('http://localhost:88/product/get-flash').then((res) =>res.json()).then((res) => {setFlashProducts(res)});
  }, []);
  return <div>
    <div id='flashWrapper'>
      <div id='dots'>{Array(3).fill([...flashProducts]).reduce((a, b) => a.concat(b)).map((p, index) => <span className={`dot ${flashPos===index?'selected':''}`} onClick={() => {moveFlash(index)}}>•</span>)}</div>
      <div id='flashContainers' ref={flashContainers}>
        {Array(3).fill([...flashProducts]).reduce((a, b) => a.concat(b)).map((p) => <FlashContainer list={p}/>)}
      </div>
    </div>
    <div id='showContainer'>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft' onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
        {Array(10).fill([...recProducts]).reduce((a, b) => a.concat(b)).map((product)=><ProductCard product={product}/>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>Popular</h1>
      <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft' disabled={true} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
      {popProducts.map((product)=> <ProductCard product={product} />)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>New</h1>
      <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft' disabled={true} onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
      {newProducts.map((product)=> <ProductCard product={product} />)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle} style={{marginLeft: '50px'}}>
      <button className='moveLeft' disabled={true} onClick={(e) => {moveSide(e, -1)}}>
        {'<'}
      </button>
      {recSupplier.map((supplier)=>
      <div className='userCard'>
        <img alt='           ' className='userPhoto' src={supplier.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
        <h4>{supplier.fullName}</h4>
      </div>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
    </div>
  </div>
}

export default Storefront;