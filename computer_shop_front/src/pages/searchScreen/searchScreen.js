import React, { useState, useEffect } from 'react';
import './searchScreen.css';
import { ProductCard } from '../../components/productCard/productCard';
import { useLocation } from 'react-router-dom';

const SearchScreen = () => {
  const { state } = useLocation();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const key = (urlParams.get('key')||'').split('::')[0];

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
    <div className='searchProducts'>
      {
        products.map(product=>(
          <ProductCard product={product} key={product._id}/>
        ))
      }
    </div>
  </div>
}

export default SearchScreen;