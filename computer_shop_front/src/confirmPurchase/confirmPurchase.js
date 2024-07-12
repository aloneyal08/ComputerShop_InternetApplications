import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom'
import {MoneyContext} from '../Contexts'

const currencies = require('../currencies.json');

const ConfirmPurchase = () =>{
  const [purchase, setPurchase] = useState(-1);
  const [total, setTotal] = useState(0);

  const {currency, exchangeRates} = useContext(MoneyContext);

  const navigate = useNavigate();

  const getAmount = () =>{
    let sum = 0;
    for(let i = 0;i < purchase.length; ++i){
      sum += Number(purchase[i].quantity);
    }
    return sum;
  };

  useEffect(()=>{
    let p = sessionStorage.getItem("purchase");
    if(p === null){
      navigate('/');
      return;
    }
    setPurchase(JSON.parse(p))
    setTotal(sessionStorage.getItem("total"));
    sessionStorage.removeItem("purchase");
    sessionStorage.removeItem("total");
  }, [])
  useEffect(()=>{

  }, [purchase])
  return <div>
    <h2>Please Confirm Your Purchase</h2>
    <h1>The Total Will Be {currencies[currency].symbol + Math.floor(total*exchangeRates[currency]*100)/100}</h1>
    <h3>Out of {getAmount()} Items{`(${purchase.length} Unique)`}</h3>
  </div>
};
export default ConfirmPurchase;