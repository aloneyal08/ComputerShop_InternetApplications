import React, {useRef, useEffect, useState, useContext} from 'react';
import { UserContext } from '../../Contexts';
import {ProductCard} from '../../components/productCard/productCard';

const History = () => {
  const {user} = useContext(UserContext)

  const [Purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/purchase/get?userId=${user._id}`).then((res)=>res.json()).then((recP) => {console.log(recP);
      setPurchases(recP)});
      
  }, [user._id]);

  return <div>
    <h1>History</h1>
    {Purchases.map((product)=><ProductCard product={product} key={product._id}/>)}
  </div>
}
export default History;