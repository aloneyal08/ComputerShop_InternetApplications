import React, {useEffect, useContext, useState} from 'react'
import './supplierDashboard.css'
import { UserContext } from '../../Contexts';
import { ProductListItem } from './listItem';
import CreateMessage from '../adminConsole/createMessage';
import { MessageListItem } from '../adminConsole/listItem';

const SupplierDashboard = () => {
  const {user} = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [messages, setMessages] = useState([]);

  const [force,update] = useState(0);
  const reload = () => update(Math.random());

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/products?id=${user._id}`).then(res=>res.json()).then(products=>{
      setProducts(products);
    });
    fetch(`${process.env.REACT_APP_SERVER_URL}/message/supplier?email=${user.email}`).then(res=>res.json()).then(messages=>{
      setMessages(messages);
    });
  }, [force, user])
  

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
    </div>
  </div>
}

export default SupplierDashboard;