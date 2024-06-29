import React, {useState, useEffect} from 'react'
import './adminConsole.css'
import RequestListItem from './requestListItem';

// JUST FOR DEVELOPMENT! REMOVE ONCE FINISHED!
const duplicateArr = (arr, times) =>
  Array(times)
      .fill([...arr])
      .reduce((a, b) => a.concat(b));

const AdminConsole = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:88/supplier/request`).then(res=>res.json()).then(rs=>{
      setRequests(duplicateArr(rs, 100));
    })
  }, [])

  return <div>
    <h1>Admin Console</h1>
    <div className='dashboard'>
      <div className='dashboardContainer'>
        <h2 className='dashboardHeader'>Supplier Requests</h2>
        <div className='dashboardList'>
          {
            requests.map((request, i)=><RequestListItem request={request} key={i}/>)
          }
        </div>
      </div>
    </div>
  </div>
}

export default AdminConsole;