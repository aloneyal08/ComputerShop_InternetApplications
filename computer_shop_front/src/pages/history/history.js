import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../Contexts';
import HistoryItem from './historyItem';


const History = () => {
  const { user } = useContext(UserContext);
  const [groupedPurchases, setGroupedPurchases] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/purchase/get?userId=${user._id}`).then(res => res.json()).then(recPurchases => {recPurchases.sort((a, b) => new Date(b.date) - new Date(a.date)); const grouped = groupPurchasesByDate(recPurchases); setGroupedPurchases(grouped);});
   }, [user._id]);
  const groupPurchasesByDate = (purchases) => {
    const grouped = [];
    let currentDate = null;
    let currentGroup = null;
    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.date).toLocaleDateString();
      if (purchaseDate != currentDate) {
        currentGroup = {
          date: purchaseDate,
          purchases: []
        };
        grouped.push(currentGroup);
        currentDate = purchaseDate;
      }
      currentGroup.purchases.push(purchase);
    });
    return grouped;
  };
  return (
    <div>
      <h1>History</h1>
      <table id='itemWrapper'>
      <tbody>
      {groupedPurchases.map(group => (
        <> 
              <tr><td><h2>{group.date}</h2></td></tr>
              {group.purchases.map(purchase => (<HistoryItem key={purchase.product._id} product={purchase.product} price={purchase.price} quantity={purchase.quantity}/>))}
        </>
      ))}
      </tbody>
      </table>
    </div>
  );
};

export default History;
