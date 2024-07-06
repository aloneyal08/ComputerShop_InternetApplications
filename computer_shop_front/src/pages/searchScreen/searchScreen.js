import React, { useState, useEffect, useCallback } from 'react';
import './searchScreen.css';
import { ProductCard } from '../../components/productCard/productCard';
import { useLocation } from 'react-router-dom';
import TagSelect from '../../components/tagSelect/tagSelect';

const SearchScreen = () => {
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [didYouMean, setDidYouMean] = useState('');
  const [key, setKey] = useState('');

  //filters
  const [tags, setTags] = useState([]);


  const getProducts = useCallback(() => {
    fetch(`http://localhost:88/product/search`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key,
        filters: JSON.stringify({tags: tags.map(t=>t.value)})
      }
    }).then(res => res.json()).then(p=>{
      setProducts(p);
    })
  }, [key, tags])

  useEffect(()=>{
    getProducts();
  }, [getProducts])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = (urlParams.get('key')||'').split('::')[0];
    setKey(urlParams.get('key'));
    getProducts();
    fetch(`http://localhost:88/spell`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key,
      }
    }).then(res => res.json()).then(p=>{
      if(p.isMisspelled) {
        setDidYouMean(p.mean);
      } else {
        setDidYouMean('');
      }
    })
  }, [getProducts, state])
  

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
        <label>Tags: </label>
        <TagSelect value={tags} onChange={(v)=>{setTags(v);getProducts();}}/>
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