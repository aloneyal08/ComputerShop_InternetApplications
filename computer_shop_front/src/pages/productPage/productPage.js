import React, {useState, useEffect, useContext} from 'react'
import {MoneyContext, TagsContext} from '../../Contexts'
import { useParams } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

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
        if(res.tags){
            res.tags = res.tags.map((tag) => tags.find(t => t._id === tag).text).filter(tag => tag);
        }
        setProduct(res)});
      fetch('http://localhost:88/review/get-rating',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: productId})
    }).then((res)=>res.json()).then((res)=>{console.log(res);setRating(res)});
    }, [productId])
    if(Object.keys(product).length === 0){return}
    return <div>
        <div id='productWrapper'>
            <img src={product.photo} />
            <div className='productInfo'>
                <Rating
                readonly={true}
                initialValue={rating}
                allowFraction={true}
                size={35}
                id='productRating'
                />
                <h1 id='productName'>{product.name}</h1>
                <div id='productDesc' dangerouslySetInnerHTML={{__html: product.description}}>
                </div>
                {   product.tags?
                    <div id='tags'>
                        {product.tags.map(tag=>(<div className='productTag'><p className='productTagName'>{tag}</p></div>))}
                    </div>
                    :
                    <></>
                }
                <h3 id='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h3>
            </div>
        </div>
    </div>
}

export default ProductPage;