import React, { useState, useEffect } from 'react';
import './searchScreen.css';
import { ProductCard } from '../../components/productCard/productCard';
import { Link, useLocation } from 'react-router-dom';

const SearchScreen = () => {
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [didYouMean, setDidYouMean] = useState('');
  const [key, setKey] = useState('');


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = (urlParams.get('key')||'').split('::')[0];
    setKey(urlParams.get('key'));

    fetch(`http://localhost:88/spell`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key
      }
    }).then(res => res.json()).then(p=>{
      if(p.isMisspelled) {
        setDidYouMean(p.mean);
      } else {
        setDidYouMean('');
      }
    })

    fetch(`http://localhost:88/product/search`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key
      }
    }).then(res => res.json()).then(p=>{
      setProducts(p);
    })
  }, [state])
  

  return <div>
    <h1>Search</h1>
    {didYouMean.length>0&&
    <a href={`/search?key=${didYouMean+(key.split('::')[1] ? '::'+key.split('::')[1] : '')}`} >
      Did you mean: <label style={{cursor: "pointer", fontStyle: "italic"}}>{
        didYouMean.split(' ').map((word, i)=>(key.split(' ')[i]===word 
        ? <label style={{cursor: "pointer"}}>{word} </label> 
        : <b>{word} </b>))
      }</label>
    </a>}
    <div className='searchContainer'>
      <div className='sort'>
        <h2>Sort:</h2>
      </div>
      <div className='filters'>
        <h2>Filter:</h2>
      </div>
      <div className='searchProducts'>
        {
          products.map(product=>(
            <ProductCard product={product} key={product._id}/>
          ))
        }
      </div>
    </div>
  </div>
}

export default SearchScreen;