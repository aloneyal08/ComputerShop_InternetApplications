import React, {useState, useEffect, useContext} from 'react'
import {MoneyContext, TagsContext} from '../../Contexts'
import { useParams } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import './productPage.css';

const currencies = require('../../currencies.json');

const ProductPage = () => {
    const {productId} = useParams();
    const {currency, exchangeRates} = useContext(MoneyContext);
    const tags = useContext(TagsContext);
    const [product, setProduct] = useState({});
    const [rating, setRating] = useState(0);

    useEffect(() => {
        fetch('http://localhost:88/product/get-id',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({id: productId})
      }).then((res)=>res.json()).then((res)=>{
        if(res.tags && tags.length > 0){
            res.tags = res.tags.map((tag) => tags.find(t => t._id === tag).text).filter(tag => tag);
        }
        setProduct(res)});
      fetch('http://localhost:88/review/get-rating',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: productId})
    }).then((res)=>res.json()).then((res)=>{setRating(res)});
    }, [productId, tags])

    if(Object.keys(product).length === 0){return}
    return <div>
        <div id='productWrapper'>
            <img id='productPhoto' src={product.photo} />
            <div className='productInfo'>
                <Rating
                readonly={true}
                initialValue={rating}
                allowFraction={true}
                size={35}
                id='productRating'
                />
                <h1 id='productName'>{product.name}</h1>
                <hr className='separator'/>
                <div id='productDesc' dangerouslySetInnerHTML={{__html: product.description}}>
                </div>
                <hr className='separator'/>
                {   product.tags?
                    <div id='tags'>
                        {product.tags.map((tag, index)=>(<div className='productTag' key={index} ><p className='productTagName'>{tag}</p></div>))}
                    </div>
                    :
                    <></>
                }
                <hr className='separator'/>
                <h3 id='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h3>
                <h6 id='productStock' style={{color: product.stock > 0?'black':'red'}}>Currently {product.stock > 0?product.stock + ' in':'out of'} stock</h6>
                <button id='cartBtn' className='button1'>Add To Cart</button>
            </div>
        </div>
    </div>
}

export default ProductPage;