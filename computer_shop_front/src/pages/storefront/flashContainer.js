import React from 'react';
import { ProductCard } from '../../components/productCard/productCard';
import './flashContainer.css'
import { emptyProduct } from '../../utils';

export const FlashContainer = ({list}) => {
	return (
	<div className='flashContainer'>
		<img alt='   ' 
			className='flashBackground'
			src={list[3]}
			style={{opacity: `${list[4]}`}}
		/>
		<h2 className='flashTitle'>{list[0]}</h2>
		<div className='flashProductContainer'>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>{list[2][0]}</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][0]!==null} product={list[1][0]?list[1][0]:emptyProduct}/>
			</div>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>{list[2][1]}</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][1]!==null} product={list[1][1]?list[1][1]:emptyProduct}/>
			</div>
			<div className='flashProduct'>
				<h4 className='flashProductTitle'>{list[2][2]}</h4>
				<ProductCard renderRating={false} renderStock={false} isClickable={list[1][2]!==null} product={list[1][2]?list[1][2]:emptyProduct}/>
			</div>
		</div>
	</div>);
}