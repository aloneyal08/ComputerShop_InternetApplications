import React, {useState, useEffect, useContext, useRef} from 'react'
import {MoneyContext, TagsContext, UserContext} from '../../Contexts'
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import './reviewCard.css'
import './productPage.css';
import { ReviewCard } from './reviewCard';
import ReactStarsRating from 'react-awesome-stars-rating';

const currencies = require('../../currencies.json');

const ProductPage = () => {
	const {productId} = useParams();
	const navigate = useNavigate();
	const {currency, exchangeRates} = useContext(MoneyContext);
	const {user, setUser} = useContext(UserContext);
	const tags = useContext(TagsContext);
	const [product, setProduct] = useState({});
	const [rating, setRating] = useState(0);
	const [reviewTitle, setReviewTitle] = useState('');
	const [reviewRating, setReviewRating] = useState(0);
	const [changedReview, setChangedReview] = useState(false);
	const [reviewDescription, setReviewDescription] = useState('');
	const [reviews, setReviews] = useState([]);
	const [ratingPercentages, setRatingPercentages] = useState([]);
	const [quantity, setQuantity] = useState('');
	const [supplierName, setSupplierName] = useState('');

	const reviewList = useRef(null);

	const onTextChange = (state) => {
		setReviewDescription(state);
	};

	const sendReview = (e) =>{
		if(!changedReview){
			alert('You have to set your Rating');
			return;
		}
		if(reviewTitle === ''){
			alert('You have to set your Title');
			return;
		}
		let review = {
			title: reviewTitle,
			product: productId,
			user: user._id,
			text: draftToHtmlPuri(convertToRaw(reviewDescription.getCurrentContent())),
			rating: reviewRating
		};
		fetch(`${process.env.REACT_APP_SERVER_URL}/review/add`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify(review)
		});
		setReviewRating(0);
		setChangedReview(false);
		navigate(0);
	};
	const onChangeQuantity = (e) => {
		e.value = Math.max(1, Math.min(e.value, product.stock));
		setQuantity(e.value);
	};
	const changeQuantity = (e, num) => {
		let input = e.currentTarget.parentElement.children[1];
		input.value = input.value===''?0:input.value;
		input.value = Number(input.value) + num;
		onChangeQuantity(input)
	};

	const addToCart = () =>{
		if(quantity === ''){
			alert('Enter Quantity of Product');
			return;
		}
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/update/cart-add`, {
		  method: 'PUT',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
			email: user.email,
			addition: {productId, quantity}
		  })
		}).then((res) => res.json()).then((res) => {
		  if(res.error) {
			alert(res.error);
		  } else {
			let tempUser = user;
			tempUser.cart.push({productId, quantity});
			setUser(tempUser);
			navigate('/cart');
		  }
		})
	};

	const buyNow = () =>{
		if(quantity === ''){
			alert('Enter Quantity of Product');
			return;
		}
		sessionStorage.setItem("purchase", JSON.stringify([{productId: product._id, quantity: quantity}]));
		sessionStorage.setItem("total", product.price*quantity);
		navigate('/purchase/confirm');
	};

	useEffect(() => {
		const blocksFromHtml = htmlToDraft("");
		const { contentBlocks, entityMap } = blocksFromHtml;
		const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
		const editorState = EditorState.createWithContent(contentState);
		setReviewDescription(editorState);
	}, []);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-id`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({id: productId})
		}).then((res)=>res.json()).then((res)=>{
			if(res.error){
				navigate('/not-found');
			}
			if(res.tags && tags.length > 0){
				res.tags = res.tags.map((tag) => tags.find(t => t._id === tag).text).filter(tag => tag);
		}
		setProduct(res)});
	}, [productId, tags, navigate])

	useEffect(() => {
		if(Object.keys(product).length > 0){
			fetch(`${process.env.REACT_APP_SERVER_URL}/review/get`,{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({product: product._id})
			}).then((res)=>res.json()).then((res)=>{
				setReviews(res);
				let percentages = [0, 0, 0, 0, 0];
				res.forEach((rev) => {
					percentages[Math.floor(rev.rating - 0.5)] += 1/res.length;
				})
				setRatingPercentages(percentages);
			});
			fetch(`${process.env.REACT_APP_SERVER_URL}/review/get-rating`,{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({product: product._id})
		}).then((res)=>res.json()).then((res)=>{setRating(res)});
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/id-get`,{
			method: 'POST',
		  	headers: {
				'Content-Type': 'application/json'
		  	},
		  	body: JSON.stringify({id: product.supplier})
	  	}).then((res)=>res.json()).then((res)=>{
			setSupplierName(res.fullName);
	  	});
		}
	}, [product])

	if(Object.keys(product).length === 0){return}
	return <div>
		<div id='productWrapper'>
			<img alt='           ' id='productPhoto' src={product.photo} />
			<div className='productInfo'>
				<div id='ratingWrapper'>
					<h2>{rating}</h2>
					<ReactStarsRating
			value={rating}
			isEdit={false}
			secondaryColor="#cccccc"
			primaryColor="#ffbc0b"
			size={33}
			id={product._id}
		  />
					<a href='#rating' onClick={() => {reviewList.current.scrollIntoView();return false;}}>{`${reviews.length} ratings`}</a>
				</div>
				<h1 id='productName'>{product.name}</h1>
				<a id='productSupplier' href={`/supplier/${product.supplier}`}>{supplierName}</a>
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
			</div>
			<div id='buyInfo'>
				{ user.loggedOut?
					<h2>You need to login in order to buy stuff</h2>
					:
					<></>
				}
				<h3 id='productPrice'>{currencies[currency].symbol + Math.floor(product.price*exchangeRates[currency]*100)/100}</h3>
				<hr className='separator' />
				<h3 id='productStock' style={{color: product.stock > 0?'black':'red'}}>Currently {product.stock > 0?product.stock + ' in':'out of'} stock</h3>
				<hr className='separator' />
				{product.stock > 0 && !user.loggedOut?
					<div id='quantityWrapper'>
						<button className='quantityBtn button1' onClick={(e) => changeQuantity(e, -1)}>-</button>
						<input onChange={(e) => {onChangeQuantity(e.currentTarget)}} type='number'></input>
						<button className='quantityBtn button1' onClick={(e) => changeQuantity(e, 1)}>+</button>
					</div>
					:
					<></>
				}
				<button disabled={product.stock <= 0 || user.loggedOut} id='cartBtn' className='button1' onClick={addToCart}>Add To Cart</button>
				<button disabled={product.stock <= 0 || user.loggedOut} id='buyBtn' className='button1' onClick={buyNow}>Buy Now</button>
			</div>
		</div>
		<div ref={reviewList} id='reviewWrapper'>
			<div id='ratingInfo'>
				{
					ratingPercentages.map((rate, index) => <div key={index} className='ratePercentage'>
						<h3>{index + 0.5} - {index + 1}</h3>
						<div className='emptyBar'><div className='fullBar' style={{'--max-width': `${rate*100}%`}} ></div></div>
						<h3>{Math.round(rate*100)}%</h3>
					</div>)
				}
			</div>
			<div id='reviewList'>
				{!user.loggedOut?
					<div className='reviewCard'>
						<header className='reviewTop'>
							<div className='reviewUser'>
								<img alt='           ' src={user.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
							</div>
							<div>
								<div className='reviewUnderText'>
									<h5 className='userName'>{user.fullName}</h5>
									<h5 className='reviewDate'>{new Date().toLocaleDateString()}</h5>
								</div>
							</div>
						</header>
						<div id='revTitleWrapper'>
			  <ReactStarsRating
				value={reviewRating}
				secondaryColor="#cccccc"
				primaryColor="#ffbc0b"
				onChange={(rate) => {setReviewRating(rate);setChangedReview(true);}}
				size={33}
				id={"Review"}
				className='addReview'
			  />
							<div id='revTitle' className="input1">
								<label>
								<input required type='text' onChange={(e) => {setReviewTitle(e.currentTarget.value);}}/>
								<span>Review Title*</span>
								</label>
							</div>
						</div>
						<Editor
						editorState={reviewDescription}
						toolbarClassName="toolbarClassName"
						wrapperClassName="wrapperClassName"
						editorClassName="reviewDescEditable scrollBar2"
						spellCheck={true}
						editorStyle={{border: '1px solid gainsboro', fontSize: '14px', lineHeight: '15px'}}
						toolbar={{
							options: ['inline', 'fontSize', 'list', 'textAlign'],
							list: {inDropdown: true}
						}}
						onEditorStateChange={onTextChange}
						placeholder='Write what you think about the product'
						/>
						<button className='button1' id='reviewBtn' onClick={sendReview}>Send Review</button>
					</div>
					:
					<div>
						To write a review please login
					</div>
				}
				{
					reviews.map((rev, index)=> <ReviewCard key={index} review={rev} />)
				}
			</div>
		</div>
	</div>
}

export default ProductPage;