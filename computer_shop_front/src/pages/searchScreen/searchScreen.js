import React, { useState, useEffect, useCallback, useContext } from 'react';
import './searchScreen.css';
import { ProductCard } from '../../components/productCard/productCard';
import TagSelect from '../../components/tagSelect/tagSelect';
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { MoneyContext, TagsContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import ReactStarsRating from 'react-awesome-stars-rating';

const SearchScreen = () => {
  const navigate = useNavigate();

  const tags = useContext(TagsContext)
  const {exchangeRates, currency} = useContext(MoneyContext);
  const [products, setProducts] = useState([]);
  const [didYouMean, setDidYouMean] = useState('');
  const [key, setKey] = useState('');
  const [minMaxPrices, setMinMaxPrices] = useState({dollar: [1, 1000], other: [1, 1000]});
  const [sort, setSort] = useState(1);

  //filters
  const [tagsFilter, setTags] = useState([]);
  const [rating, setRating] = useState(0.5);
  const [rangeValue, setRangeValue] = useState([-1, -1]);
  const [prices, setPrices] = useState([-1, -1]);
  const [suppliers, setSuppliers] = useState([]);
  const [dRangeValue, setDRangeValue] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [firstSearch, setFirstSearch] = useState(true);

  const setRangeValuePrice = useCallback((prices) => {
    setRangeValue([
      Math.floor(prices[0]*exchangeRates[currency]), 
      Math.ceil(prices[1]*exchangeRates[currency])
    ])
  }, [currency, exchangeRates])

  const createSearchStr = useCallback(() => {
    if(prices[0] === 0||tags.length===0||prices[0] === -1||prices[1] === -1) return;
    const biggerThan = prices[0]===minMaxPrices.dollar[0] ? "" : `>${prices[0]}`;
    const smallerThan = prices[1]===minMaxPrices.dollar[1] ? "" : `<${prices[1]}`;
    const arr = [
      ["tags", tagsFilter.map(t=>tags.find(t2=>t2._id===t.value).text).join('^')],
      ["price",  smallerThan.length>0||biggerThan.length>0 ? biggerThan + (biggerThan.length>0?"^":"") + smallerThan : ''],
      ["rating", rating<=0.5 ? '' : rating],
      ["suppliers", suppliers.filter(s=>!s.checked).map(s=>s.id).join(',')],
      ["discount", discount===0 ? '' : discount],
      ["sort", sort===1 ? '' : sort]
    ].filter(v=>v[1] !== '');
    const params = arr.map(val=>val[0] + "=" + val[1]).join(',');
    const str = key.split("::")[0] + (params.length ? "::" + params : '');
    navigate("/search?key="+str);
  }, [discount, key, minMaxPrices.dollar, navigate, prices, rating, sort, suppliers, tags, tagsFilter])

  const getProducts = useCallback(() => {
    if(!exchangeRates[currency]) return;
    fetch(`http://localhost:88/product/search`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        key: key.split('::')[0],
        sort,
        filters: JSON.stringify({
          tags: tagsFilter.map(t=>t.value), 
          suppliers: suppliers.length ? suppliers.filter(s=>s.checked).map(s=>s.id) : null,
          prices,
          rating,
          discount
        })
      }
    }).then(res => res.json()).then(res=>{
      setFirstSearch(false);
      createSearchStr();
      if(firstSearch){
        setMinMaxPrices({dollar: [res.price.min, res.price.max], other: [
          Math.floor(res.price.min*exchangeRates[currency]),
          Math.ceil(res.price.max*exchangeRates[currency])
        ]});
        setPrices([prices[0]===-1?res.price.min:prices[0], prices[1]===-1?res.price.max:prices[1]]);
        setSuppliers(res.suppliers.map(s=>({...s, checked: suppliers.length===0||!suppliers.includes(s.id)})))
      } else {
        setProducts(res.products);
      }
    })
  }, [createSearchStr, currency, discount, exchangeRates, firstSearch, key, prices, rating, sort, suppliers, tagsFilter])

  const convertRangeToPrice = () => {
    if(rangeValue[0]===-1||rangeValue[1]===-1||!exchangeRates[currency]) return;

    setPrices([rangeValue[0]/exchangeRates[currency], rangeValue[1]/exchangeRates[currency]]);
  }

  useEffect(()=>{
    if(!exchangeRates || !exchangeRates[currency]) return;
    setMinMaxPrices({dollar: minMaxPrices.dollar, other: [
      Math.floor(minMaxPrices.dollar[0]*exchangeRates[currency]),
      Math.ceil(minMaxPrices.dollar[1]*exchangeRates[currency])
    ]})
    setRangeValuePrice(prices);
  }, [currency, exchangeRates, minMaxPrices.dollar, prices, setRangeValuePrice])
  useEffect(()=>{
    setDRangeValue(discount);
  }, [discount])

  useEffect(()=>{
    getProducts();
  }, [getProducts])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.get('key')) {
      navigate("/search?key=");
      return;
    }

    setKey(urlParams.get('key'));

    const data = (urlParams.get('key')||'').split('::')
    const key = data[0];
    const paramsArr = !data[1] ? [] : data[1].split(",").map(param=>{
      return param.split("=");
    });
    const params = {};
    paramsArr.forEach(p=>{
      if(!p[1]) return;
      params[p[0]] = p[1];
    });

    if(params.tags) {
      setTags(params.tags.split('^').map(name=>{
        const tag = tags.find(t=>t.text===name);
        if(tag) return {name: name, value: tag._id};
        return null;
      }).filter(t=>t!==null))
    }
    if(params.price) {
      const conditions = params.price.split('^');
      let prices = [-1, -1]
      conditions.forEach(con=>{
        if(isNaN(Number(con.substring(1))))return;
        if(con[0] === '>')
          prices = [Number(con.substring(1)), prices[1]];
        if(con[0] === '<')
          prices = [prices[0], Number(con.substring(1))];
      })
      setPrices(prices);
    }
    if(params.rating) {
      setRating(Number(params.rating));
    }
    if(params.discount) {
      setDiscount(Number(params.discount));
    }
    if(params.suppliers) {
      setSuppliers(params.suppliers.split('^'));
    }
    if(params.sort)
      setSort(Number(params.sort)||1);

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
  }, [navigate, tags])
  
  const checkSupplier = (id) => {
    setSuppliers(suppliers.map(s=>({...s, checked: (s.id === id ? !s.checked : s.checked)})))
  }

  return <div>
    <h1 className='searchHeader'>Search</h1>
    <div className='searchContainer'>
      <div className='sort'>
        {didYouMean.length>0&&didYouMean.toLocaleLowerCase()!==key.split("::")[0].toLocaleLowerCase()&&
        <a href={`/search?key=${didYouMean+(key.split('::')[1] ? '::'+key.split('::')[1] : '')}`} className='didYouMean'>
          Did you mean: <label style={{cursor: "pointer", fontStyle: "italic"}}>{
            didYouMean.split(' ').map((word, i)=>(key.split(' ')[i]===word 
            ? <label style={{cursor: "pointer"}} key={i}>{word} </label> 
            : <b key={i}>{word} </b>))
          }</label>
        </a>}
        <div style={{display: "flex", float: "right", marginRight: "30px", alignItems: "center"}}>
          <label style={{marginRight: "10px"}}>Sort by:</label>
          <select onChange={(e)=>setSort(e.target.value)} value={sort} className='select1'>
            <option value="1">Best Match</option>
            <option value="2">Price: Low to high</option>
            <option value="3">Price: High to low</option>
            <option value="4">Best rated</option>
            <option value="5">Newest</option>
          </select>
        </div>
      </div>
      <div className='filters'>
        <section>
          <label>Price:</label>
          <div style={{display: "flex", alignItems: "center"}}>
            <div className="input1 num" style={{width: "70px"}}>
              <label>
                <input required type='number' value={rangeValue[0]===-1 ? "" : rangeValue[0]}
                disabled={true} style={{textAlign: "center"}}  
              />
              </label>
            </div>
            <RangeSlider min={minMaxPrices.other[0]} max={minMaxPrices.other[1]}  step={1} value={rangeValue} onInput={setRangeValue}
              onRangeDragEnd={convertRangeToPrice} onThumbDragEnd={convertRangeToPrice} className="range1"
            />
            <div className="input1 num" style={{width: "70px"}}>
              <label>
                <input required type='number' value={rangeValue[1]===-1 ? "" : rangeValue[1]}
                disabled={true} style={{textAlign: "center"}}    
              />
              </label>
            </div>
          </div>
        </section>
        <section>
          <label>Discount:</label>
          <div style={{display: "flex", alignItems: "center"}}>
            <RangeSlider
              className="single-thumb range1"
              step={1}
              min={0} max={99}
              value={[0, dRangeValue]}
              thumbsDisabled={[true, false]}
              rangeSlideDisabled={true}
              onInput={(value)=>setDRangeValue(value[1])}
              onThumbDragEnd={()=>setDiscount(dRangeValue)}
            />
            <div className="input1 num" style={{width: "70px"}}>
              <label>
                <input required type='text' value={dRangeValue + '%'} 
                disabled={true} style={{textAlign: "center"}}    
              />
              </label>
            </div>
          </div>
        </section>
        <section>
          <label>Rating:<br/></label>
          <div className='searchRating'>
            <ReactStarsRating 
              value={rating} 
              onChange={setRating}
              secondaryColor="#cccccc"
              primaryColor="#ffbc0b"
              size={35}
            /> and above<br/>
          </div>
        </section>
        <section>
          <label>Tags: </label>
          <TagSelect value={tagsFilter} onChange={(v)=>{setTags(v);getProducts();}} isAll={true}/>
        </section>
        <section>
          <label>Suppliers: </label>
          <div style={{marginTop: "20px"}}>
            {
              suppliers.map((supplier, i)=>{
                return <div key={i}>
                  <div className="checkbox1">
                    <input checked={supplier.checked} id="supplierCheck" className="substituted" type="checkbox" aria-hidden="true" 
                      onChange={()=>checkSupplier(supplier.id)}/>
                    <label htmlFor="supplierCheck">{supplier.name}</label>
                  </div>
                </div>
              })
            }
          </div>
        </section>
      </div>
      <div className='searchProducts'>
        {
          products.map(product=>(
            <ProductCard product={product} key={product._id}/>
          ))
        }
      </div>
      {products.length===0&&<h2>No Products Found...</h2>}
    </div>
  </div>
}

export default SearchScreen;