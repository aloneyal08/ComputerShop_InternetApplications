import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoneyContext, UserContext} from '../Contexts';
import './confirmPurchase.css';

const currencies = require('../currencies.json');

const ConfirmPurchase = () =>{
  const [purchase, setPurchase] = useState(-1);
  const [total, setTotal] = useState(0);

  const {currency, exchangeRates} = useContext(MoneyContext);
  const {user, setUser} = useContext(UserContext);

  const navigate = useNavigate();

  const getAmount = () =>{
    let sum = 0;
    for(let i = 0;i < purchase.length; ++i){
      sum += Number(purchase[i].quantity);
    }
    return sum;
  };

  const confirm = () =>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/purchase/buy-multiple`, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: user._id,
				list: purchase
			})
		}).then((res) => res.json()).then((res) => {
			if(res.error) {
				alert(res.error);
			} else {
				let tempUser = user;
				tempUser.cart = [];
				setUser(tempUser);
				navigate('/');
			}
		})
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
  }, [navigate])
  useEffect(()=>{

  }, [purchase])
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <h1 style={{fontSize: '50px'}}>Please Confirm Your Purchase</h1>
    <h1 style={{fontSize: '45px'}}>The Total Will Be {currencies[currency].symbol + Math.floor(total*exchangeRates[currency]*100)/100}</h1>
    <h3  style={{fontSize: '30px'}}>{getAmount()} Items{`(${purchase.length} Unique)`} will be Bought</h3>
    <div id='confirmContainer'>
      <button className='button1' onClick={() => {navigate('/')}}>Cancel</button>
      <button className='button1' onClick={confirm}>Confirm</button>
    </div>
  </div>
};
export default ConfirmPurchase;