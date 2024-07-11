import React, {useEffect, useContext, useState} from 'react'
import './supplierDashboard.css'
import { MoneyContext, UserContext } from '../../Contexts';
import { ProductListItem } from './listItem';
import CreateMessage from '../adminConsole/createMessage';
import { MessageListItem } from '../adminConsole/listItem';
import BarGraph from '../../components/graphs/barGraph';
import { nFormatter } from '../../utils';
import AvgGraph from '../../components/graphs/avgGraph';
import LineGraph from '../../components/graphs/lineGraph';

const currencies = require('../../currencies.json');

const getTimeData = (timeFrame) => {
  const now = new Date();
  if(timeFrame === "year") {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);
    return {
      startDate,
      endDate: now,
      timeFrame
    }
  }
  if(timeFrame === "month") {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setHours(0,0,0,0);
    return {
      startDate,
      endDate: now,
      timeFrame
    }
  }
  if(timeFrame === "week") {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0,0,0,0);
    return {
      startDate,
      endDate: now,
      timeFrame
    }
  }
}

const SupplierDashboard = () => {
  const {user} = useContext(UserContext);
  const {exchangeRates, currency} = useContext(MoneyContext);

  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [messages, setMessages] = useState([]);
  const [supplierRating, setSupplierRating] = useState([]);
  const [ratingData, setRatingData] = useState(getTimeData('year'));
  
  const [purchaseData, setPurchaseData] = useState(getTimeData('year'));
  const [supplierPurchases, setSupplierPurchases] = useState([]);
  const [purchaseYAxis, setPurchaseYAxis] = useState('money');

  const [viewData, setViewData] = useState(getTimeData('year'));
  const [supplierViews, setSupplierViews] = useState([]);

  const [ratioData, setRatioData] = useState(getTimeData('year'));
  const [supplierRatio, setSupplierRatio] = useState([]);
  const [ratioYAxis, setRatioYAxis] = useState('amount');


  const [force,update] = useState(0);
  const reload = () => update(Math.random());

  const changeRatingTimeFrame = (e) => setRatingData(getTimeData(e.target.value));
  const changePurchaseTimeFrame = (e) => setPurchaseData(getTimeData(e.target.value));
  const changeViewTimeFrame = (e) => setViewData(getTimeData(e.target.value));
  const changeRatioTimeFrame = (e) => setRatioData(getTimeData(e.target.value));


  useEffect(()=>{
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/rating/time`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: user._id,
        ...ratingData
      })
    }).then(res=>res.json()).then(rating=>{
      setSupplierRating(rating);
    });
  }, [ratingData, user._id, force])

  useEffect(()=>{
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/purchases/time`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: user._id,
        type: purchaseYAxis,
        ...purchaseData
      })
    }).then(res=>res.json()).then(data=>{
      setSupplierPurchases(data);
    });
  }, [purchaseData, purchaseYAxis, user._id, force])

  useEffect(()=>{
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/views/time`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: user._id,
        ...viewData
      })
    }).then(res=>res.json()).then(data=>{
      setSupplierViews(data);
    });
  }, [force, user._id, viewData])

  useEffect(()=>{
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/ratio/time`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: user._id,
        type: ratioYAxis,
        ...ratioData
      })
    }).then(res=>res.json()).then(data=>{
      setSupplierRatio(data);
    });
  }, [force, ratioData, ratioYAxis, user._id, viewData])

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/products?id=${user._id}`).then(res=>res.json()).then(products=>{
      setProducts(products);
    });
    fetch(`${process.env.REACT_APP_SERVER_URL}/message/supplier?email=${user.email}`).then(res=>res.json()).then(messages=>{
      setMessages(messages);
    });
  }, [user._id, user.email, force])

  return <div>
    <h1>Supplier Dashboard</h1>
    <div className='dashboard'>
      <div className='dashboardContainer'>
      <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Products</h2>
          <input 
            type='text' className='searchBox supplierSearch' onChange={(e)=>setSearchProduct(e.target.value)} 
            placeholder={`Search Products...`} value={searchProduct} style={{width: "300px"}}
          />
        </div>
        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader'>
                <th> </th>
                <th>Name</th>
                <th>Price</th>
                <th> </th>
              </tr>
              {
                products.filter(p=>
                  p.name.toLowerCase().includes(searchProduct.toLocaleLowerCase())
                ).map((product, i)=><ProductListItem product={product} key={i}/>)
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Messages</h2>
          <CreateMessage reload={reload}/>
        </div>

        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "white"}}>
                <th style={{backgroundColor: "white"}}>Subject</th>
                <th style={{backgroundColor: "white"}}>Date</th>
              </tr>
              {
                messages.map((message, i)=><MessageListItem message={message} key={i} reload={reload} isTo={false}/>)
              }
            </tbody>
          </table>
          {messages.length===0&&<h3>No Messages</h3>}
        </div>
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Rating Over Time</h2>
          <select onChange={changeRatingTimeFrame} value={ratingData.timeFrame} className='select1'>
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="week">Last week</option>
          </select>
        </div>
        <AvgGraph height={520} data={supplierRating} range={[0,5]} timeFrame={ratingData.timeFrame} color='#cfac51'/>
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Purchases Over Time</h2>
          <div style={{display: "flex", gap: "10px"}}>
            <select onChange={(e)=>setPurchaseYAxis(e.target.value)} value={purchaseYAxis} className='select1'>
              <option value="money">Income</option>
              <option value="amount">Amount</option>
            </select>
            <select onChange={changePurchaseTimeFrame} value={purchaseData.timeFrame} className='select1'>
              <option value="year">Last Year</option>
              <option value="month">Last Month</option>
              <option value="week">Last week</option>
            </select>
          </div>
        </div>
        <BarGraph 
          height={520} data={supplierPurchases} 
          timeFrame={purchaseData.timeFrame} color={purchaseYAxis==='money' ?'#4dab66' : '#518194'}
          yAxisTickFormat={d=>{
            return purchaseYAxis==='money' ?  nFormatter(d*exchangeRates[currency]) + currencies[currency].symbol : (Math.floor(d)===d ? nFormatter(d) : '')
          }}
        />
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Views Over Time</h2>
          <select onChange={changeViewTimeFrame} value={viewData.timeFrame} className='select1'>
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="week">Last week</option>
          </select>
        </div>
        <BarGraph 
          height={520} data={supplierViews} 
          timeFrame={viewData.timeFrame}
          yAxisTickFormat={d=>nFormatter(d)}
        />
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader' style={{fontSize: "20px"}}>Purchases to View Over Time</h2>
          <div style={{display: "flex", gap: "10px"}}>
            <select onChange={(e)=>setRatioYAxis(e.target.value)} value={ratioYAxis} className='select1'>
              <option value="money">Income</option>
              <option value="amount">Amount</option>
            </select>
            <select onChange={changeRatioTimeFrame} value={ratioData.timeFrame} className='select1'>
              <option value="year">Last Year</option>
              <option value="month">Last Month</option>
              <option value="week">Last week</option>
            </select>
          </div>
        </div>
        <LineGraph 
          height={520} data={supplierRatio} 
          timeFrame={ratioData.timeFrame}
          color={ratioData==='money' ?'#4dab66' : 'steelblue'}
          yAxisTickFormat={d=>{
            return ratioYAxis==='money' ?  nFormatter(d*exchangeRates[currency]) + currencies[currency].symbol : (Math.floor(d)===d ? nFormatter(d) : '')
          }}
        />
      </div>
    </div>
  </div>
}

export default SupplierDashboard;