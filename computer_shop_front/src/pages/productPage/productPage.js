import React, {useState, useEffect, useContext} from 'react'
import {MoneyContext, TagsContext, UserContext} from '../../Contexts'
import { useParams, useNavigate } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import './productPage.css';
import { ReviewCard } from './reviewCard';

const currencies = require('../../currencies.json');

const ProductPage = () => {
    const {productId} = useParams();
    const navigate = useNavigate();
    const {currency, exchangeRates} = useContext(MoneyContext);
    const {user} = useContext(UserContext);
    const tags = useContext(TagsContext);
    const [product, setProduct] = useState({});
    const [rating, setRating] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [changedReview, setChangedReview] = useState(false);
    const [reviewDescription, setReviewDescription] = useState('');
    const [reviews, setReviews] = useState([]);
    
    const onTextChange = (state) => {
        setReviewDescription(state);
    };
        
    const sendReview = (e) =>{
        if(!changedReview){
            alert('You have to set your Rating');
            setIsPopupOpen(false);
            return;
        }
        let review = {
            product: productId,
            user: user._id,
            text: draftToHtmlPuri(convertToRaw(reviewDescription.getCurrentContent())),
            rating: reviewRating
        };
        fetch('http://localhost:88/review/add',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        });
        setIsPopupOpen(false);
        setReviewRating(0);
        setChangedReview(false);
    };

    useEffect(() => {
        const blocksFromHtml = htmlToDraft("");
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const editorState = EditorState.createWithContent(contentState);
        setReviewDescription(editorState);
    }, []);

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
        body: JSON.stringify({product: productId})
    }).then((res)=>res.json()).then((res)=>{setRating(res)});
    fetch('http://localhost:88/review/get',{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({product: productId})
}).then((res)=>res.json()).then((res)=>{setReviews(res);});

    }, [productId, tags])

    if(Object.keys(product).length === 0){return}
    return <div>
        <div id='productWrapper'>
            <img alt='           ' id='productPhoto' src={product.photo} />
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
        <div id='reviewWrapper'>
            {!user.loggedOut?
                <>
                    <button id='addReviewBtn' className='button1' onClick={(e) => {setIsPopupOpen(true);e.currentTarget.parentElement.children[1].scrollIntoView();}}>Add a Review</button>
                    <div id='reviewPopup' className={'popup ' + (isPopupOpen?'scale1':'')} >
                        <Rating
                        onClick={(rate) => {setReviewRating(rate);setChangedReview(true);}}
                        initialValue={reviewRating}
                        allowFraction={true}
                        size={35}
                        id='productRating'
                        />
                        
                        <Editor
                        editorState={reviewDescription}
                        toolbarClassName="toolbarClassName"
                        wrapperClassName="wrapperClassName"
                        editorClassName="editorClassName"
                        spellCheck={true}
                        editorStyle={{minHeight: '15vh', border: '1px solid gainsboro', fontSize: '14px', lineHeight: '15px'}}
                        toolbar={{
                            options: ['inline', 'fontSize', 'list', 'textAlign'],
                            list: {inDropdown: true}
                        }}
                        onEditorStateChange={onTextChange}
                        placeholder='Write what you think about the product'
                        />
                        <div id='buttonContainer'>
                            <button className='button1' id='reviewCancel' onClick={()=>setIsPopupOpen(false)}>Cancel</button>
                            <button className='button1' id='reviewSubmit' onClick={sendReview}>Submit</button>
                        </div>
                    </div>
                </>
                :
                <></>
            }
            {
                reviews.map((rev)=> <ReviewCard review={rev} />)
            }
        </div>
    </div>
}

export default ProductPage;