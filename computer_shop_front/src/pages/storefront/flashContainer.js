import React from 'react';
import { ProductCard } from '../../components/productCard/productCard';
import './flashContainer.css'

export const FlashContainer = ({list}) => {
    return (
    <div className='flashContainer'>
        <h2 className='flashTitle'>The {list[0]} Products</h2>
        <div className='flashProductContainer'>
            <div className='flashProduct'>
                <h3>The {list[0]} Today</h3>
                <ProductCard getSupplier={true} getRate={true} product={list[1][0]}/>
            </div>
            <div className='flashProduct'>
                <h3>The {list[0]} This Week</h3>
                <ProductCard getSupplier={true} getRate={true} product={list[1][1]}/>
            </div>
            <div className='flashProduct'>
                <h3>The {list[0]} This Month</h3>
                <ProductCard getSupplier={true} getRate={true} product={list[1][2]}/>
            </div>
        </div>
    </div>);
}