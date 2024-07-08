import React, { useEffect, useState } from 'react'
import './supplierPage.css'
import { useNavigate, useParams } from 'react-router-dom';
import ReactStarsRating from 'react-awesome-stars-rating';
import { ProductCard } from '../../components/productCard/productCard';

const SupplierPage = () => {
  const navigate = useNavigate();
  const {supplierId} = useParams();
  const [supplier, setSupplier] = useState({});
  const [tags, setTags] = useState([]);
  const [tab, setTab] = useState('Home');


  const [recProducts, setRecProducts] = useState([]);
  const [popProducts, setPopProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [tagProducts, setTagProducts] = useState([]);


  useEffect(() => {
    fetch(`http://localhost:88/user/supplier?id=${supplierId}`).then(res => res.json()).then(data => {
      if(data.error) {
        navigate('/')
        return;
      }
      setSupplier(data.supplier);
      setTags(data.tags);
      fetch(`http://localhost:88/product/get?supplier=${supplierId}`).then((res)=>res.json()).then((res) => {setRecProducts(res)});
      fetch(`http://localhost:88/product/get-popular`).then((res)=>res.json()).then((res) => {setPopProducts(res)});
      fetch(`http://localhost:88/product/get-new`).then((res)=>res.json()).then((res) => {setNewProducts(res)});
    })
  }, [navigate, supplierId])

  useEffect(() => {
    fetch(`http://localhost:88/product/search`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key: '',
        sort: 1,
        filters: JSON.stringify({
          tags: [tab], 
          suppliers: null,
          prices: null,
          rating: 0,
          discount: 0
        })
      }
    }).then(res => res.json()).then(data => {
      if(data.error) {
        navigate('/')
        return;
      }
      setTagProducts(data.products);
    });
  }, [navigate, tab])
  
  
  const moveSide = (e, side) =>{
    const cardWidth = e.currentTarget.parentElement.children[1].clientWidth + 24.8;
    let scrollEnd = Math.max(0, Math.min(e.currentTarget.parentElement.scrollLeft + (cardWidth*5*side), e.currentTarget.parentElement.scrollWidth - e.currentTarget.parentElement.clientWidth));
    scrollEnd = Math.round(scrollEnd/cardWidth)*cardWidth;
    e.currentTarget.parentElement.scroll(scrollEnd, 0);
  };

  const scrollHandle = (e) => {
    let pos = Math.round(e.currentTarget.scrollLeft);
    let limit = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;
    e.currentTarget.children[0].disabled = (pos === 0);
    e.currentTarget.children[e.currentTarget.children.length - 1].disabled = (pos === limit);
  }

  const mainTabs = [
    {text: 'Home'},
    {text: 'Recommended'},
    {text: 'Popular'},
    {text: 'New'},
  ]

  let arr = tagProducts;
  if(tab === 'Recommended') arr = recProducts;
  if(tab === 'Popular') arr = popProducts;
  if(tab === 'New') arr = newProducts;

  console.log(supplier);

  return <div>
    <div className='supplierHeaderCon'>
      <div className='supplierBackground' style={{backgroundImage: `url(${supplier.background})`}}/>
      <h1 style={{fontSize: "40px"}}>{supplier.fullName}</h1>
      <ReactStarsRating 
        value={5} 
        isEdit={false}
        secondaryColor="#cccccc"
        primaryColor="#ffbc0b"
        size={20}
      /> 
      <table className='supplierData'>
        <tbody>
          <tr>
            <td>Contact phone:</td>
            <td>{supplier.phone}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{supplier.email}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className='supplierTabs'>
      {
        mainTabs.concat(tags).map(tag=>(
          <button 
            key={tag._id||tag.text} className={tab===(tag._id||tag.text) ? 'active' : ''}
            onClick={()=>setTab(tag._id||tag.text)}
          >{tag.text}</button>
        ))
      }
    </div>

    <div className='supplierMainArea'>
      {tab === "Home"
        ? <>
          <h1 className='title'>Recommended</h1>
          <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
            <button className='moveLeft' onClick={(e) => {moveSide(e, -1)}}>
              {'<'}
            </button>
            {recProducts.map((product)=><ProductCard product={product} key={product._id}/>)}
            <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
              {'>'}
            </button>
          </div>
          <h1 className='title'>Popular</h1>
          <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
            <button className='moveLeft' disabled={true} onClick={(e) => {moveSide(e, -1)}}>
              {'<'}
            </button>
          {popProducts.map((product)=> <ProductCard product={product} key={product._id}/>)}
            <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
              {'>'}
            </button>
          </div>
          <h1 className='title'>New</h1>
          <div className='itemContainer scrollBar1' onLoad={scrollHandle} onScroll={scrollHandle}>
            <button className='moveLeft' disabled={true} onClick={(e) => {moveSide(e, -1)}}>
              {'<'}
            </button>
          {newProducts.map((product)=> <ProductCard product={product} key={product._id}/>)}
            <button className='moveRight' onClick={(e) => {moveSide(e, 1)}}>
              {'>'}
            </button>
          </div>     
        </>
        : <div className='supplierProducts'>
          {arr.map((product)=> <ProductCard product={product} key={product._id}/>)}
        </div>
      } 
    </div>

  </div>
}

export default SupplierPage;