import React, {useState, useEffect} from 'react'
import './adminConsole.css'
import {RequestListItem, SupplierListItem} from './listItem';

// JUST FOR DEVELOPMENT! REMOVE ONCE FINISHED!
const duplicateArr = (arr, times) =>
  Array(times)
      .fill([...arr])
      .reduce((a, b) => a.concat(b));

const AdminConsole = () => {
  const [requests, setRequests] = useState([]);
  const [force,update] = useState(0);
  const reload = () => update(Math.random());

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:88/supplier/request`).then(res=>res.json()).then(rs=>{
      setRequests(duplicateArr(rs, 100));
    });
    fetch(`http://localhost:88/user/suppliers`).then(res=>res.json()).then(s=>{
      setSuppliers(duplicateArr(s, 100));
    });
  }, [force])

  return <div>
    <h1>Admin Console</h1>
    <div className='dashboard'>
      <div className='dashboardContainer'>
        <h2 className='dashboardHeader'>Supplier Requests</h2>
        <div className='dashboardList'>
          <table>
            <tr className='dashboardListItem adminTblHeader'>
              <th>Company Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
            {
              requests.map((request, i)=><RequestListItem request={request} key={i} reload={reload}/>)
            }
          </table>
        </div>
      </div>
      <div className='dashboardContainer'>
        <h2 className='dashboardHeader'>Suppliers</h2>
        <div className='dashboardList'>
          <table>
            <tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "#b59c9c"}}>
              <th style={{backgroundColor: "#b59c9c"}}>Company Name</th>
              <th style={{backgroundColor: "#b59c9c"}}>Phone</th>
              <th style={{backgroundColor: "#b59c9c"}}>Email</th>
              <th style={{backgroundColor: "#b59c9c"}}>Action</th>
            </tr>
            {
              suppliers.map((supplier, i)=><SupplierListItem supplier={supplier} key={i} reload={reload}/>)
            }
          </table>
        </div>
      </div>
    </div>
  </div>
}

export default AdminConsole;