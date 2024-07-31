import React, {useRef, useEffect, useState, useContext} from 'react';
import './storefront.css';
import { FlashContainer } from './flashContainer';
import {ProductCard} from '../../components/productCard/productCard';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Contexts';

const Storefront = () => {
	const {user} = useContext(UserContext)

	const [recProducts, setRecProducts] = useState([]);
	const [popProducts, setPopProducts] = useState([]);
	const [newProducts, setNewProducts] = useState([]);
	const [recSupplier, setRecSupplier] = useState([]);
	const [flashProducts, setFlashProducts] = useState([]);
	const [flashSide, setFlashSide] = useState(1);
	const [flashPos, setFlashPos] = useState(0);
	const [resetDelay, setResetDelay] = useState(false);

	const flashContainers = useRef();
	const navigate = useNavigate();

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
		if(flashContainers !== null && flashProducts.length){
			if(flashContainers.current.children.length !== 0){
				let pos = to === -1?flashPos + flashSide:to;
				if(pos === 0){
					setFlashSide(1);
				}
				if(pos === flashContainers.current.children.length - 1){
					setFlashSide(-1);
				}
				flashContainers.current.scroll(pos * (flashContainers.current.children[0].clientWidth), 0);
				setFlashPos(pos);
				setResetDelay(true);
			}
		}
	}

  const moveSide = (e, side) =>{
    const cardWidth = e.currentTarget.parentElement.children[1].clientWidth + 24.8;
    let scrollEnd = Math.max(0, Math.min(e.currentTarget.parentElement.scrollLeft + (cardWidth*5*side), e.currentTarget.parentElement.scrollWidth - e.currentTarget.parentElement.clientWidth));
    let roundedScrollEnd = Math.round(scrollEnd/cardWidth)*cardWidth;
    e.currentTarget.parentElement.scroll(roundedScrollEnd, 0);
  };

	const scrollHandle = (e) => {
		let pos = Math.round(e.currentTarget.scrollLeft);
		let limit = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;
		e.currentTarget.children[0].disabled = (pos === 0);
		e.currentTarget.children[e.currentTarget.children.length - 1].disabled = (pos === limit);
	}
	
	useInterval(moveFlash, resetDelay?null:5000)

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/get?userId=${user._id}`).then((res)=>res.json()).then((recP) => {
      setRecProducts(recP)
      fetch(`${process.env.REACT_APP_SERVER_URL}/user/get-suppliers`).then((res)=>res.json()).then((res) => {
        const recSuppliers = res.map(sup=>({...sup, pos: recP.map(p=>p.supplier).indexOf(sup._id)})).sort((a, b) => a.pos===-1?1:b.pos===-1?-1:a.pos-b.pos);
        setRecSupplier(recSuppliers);
      });
    });
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-popular`).then((res)=>res.json()).then((res) => {setPopProducts(res)});
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-new`).then((res)=>res.json()).then((res) => {setNewProducts(res)});
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-flash`).then((res) =>res.json()).then((res) => {setFlashProducts(res)});
  }, [user._id]);
  return <div>
    <div id='flashWrapper'>
      <div id='dots'>{flashProducts.map((p, index) => <span key={index} className={`dot ${flashPos===index?'selected':''}`} onClick={() => {moveFlash(index)}}>•</span>)}</div>
      <div id='flashContainers' ref={flashContainers}>
        {flashProducts.map((p, i) => <FlashContainer list={p} key={i}/>)}
      </div>
    </div>
    <div style={{paddingTop: "350px"}}/>
    <div id='showContainer'>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1 hover' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft' onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
        {recProducts.map((product)=><ProductCard product={product} key={product._id}/>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>Popular</h1>
      <div className='itemContainer scrollBar1 hover' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft'  onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
      {popProducts.map((product)=> <ProductCard product={product} key={product._id}/>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>New</h1>
      <div className='itemContainer scrollBar1 hover' onLoad={scrollHandle} onScroll={scrollHandle}>
        <button className='moveLeft' onClick={(e) => {moveSide(e, -1)}}>
          {'<'}
        </button>
      {newProducts.map((product)=> <ProductCard product={product} key={product._id}/>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
      <h1 className='title'>Recommended</h1>
      <div className='itemContainer scrollBar1 hover' onLoad={scrollHandle} onScroll={scrollHandle} style={{marginLeft: '50px', minHeight: 0}}>
      <button className='moveLeft'onClick={(e) => {moveSide(e, -1)}}>
        {'<'}
      </button>
      {recSupplier.map((supplier)=>
      <div className='userCard' key={supplier._id} onClick={()=>navigate(`/supplier/${supplier._id}`)}>
        <img alt='           ' className='userPhoto' src={supplier.profilePhoto || ''} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
        <h4 className='supplierName'>{supplier.fullName}</h4>
      </div>)}
        <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
          {'>'}
        </button>
      </div>
    </div>
  </div>
}

export default Storefront;