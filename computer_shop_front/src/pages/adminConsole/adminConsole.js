import React, {useState, useEffect} from 'react'
import './adminConsole.css'

// JUST FOR DEVELOPMENT! REMOVE ONCE FINISHED!
const duplicateArr = (arr, times) =>
  Array(times)
      .fill([...arr])
      .reduce((a, b) => a.concat(b));

const getStatusObj = (s) => {
  switch (s) {
    case 0:
      return {message: "... Pending", color: "#998a32"}
    case 1:
      return {message: "✓ Accepted", color: "green"}
    case 2:
      return {message: "X Rejected", color: "red"}
    case 3:
      return {message: "X Cancelled", color: "grey"}
    default:
      return {message: "X Error", color: "red"}
  }
}

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
            requests.map(request=>{
              const status = getStatusObj(request.status);
              return <div className='dashboardListItem'>
                {request.user.fullName}
                <div style={{color: status.color}} className='statusText'>
                  {status.message}
                </div>
              </div>
            })
          }
        </div>
      </div>
    </div>
  </div>
}

export default AdminConsole;