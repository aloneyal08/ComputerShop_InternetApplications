import React from 'react';
import { ProductCard } from '../../components/productCard/productCard';
import './flashContainer.css'

export const FlashContainer = ({list}) => {
	let emptyProduct = {
		name: 'No Product Yet',
		price: '⠀⠀',
		supplierName: '⠀⠀⠀⠀⠀⠀⠀⠀',
		photo: 'fail'
	}
	return (
	<div className='flashContainer'>
		<h2 className='flashTitle'>The {list[0]} Products</h2>
		<div className='flashProductContainer'>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>The {list[0]} Today</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][0]!==null} product={list[1][0]?list[1][0]:emptyProduct}/>
			</div>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>The {list[0]} This Week</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][1]!==null} product={list[1][1]?list[1][1]:emptyProduct}/>
			</div>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>The {list[0]} This Month</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][2]!==null} product={list[1][2]?list[1][2]:emptyProduct}/>
			</div>
		</div>
	</div>);
}