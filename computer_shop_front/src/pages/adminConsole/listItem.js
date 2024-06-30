import React, {useState, useRef, useContext} from 'react'
import { formatPhoneNumber } from '../../utils';
import { UserContext } from '../../Contexts'

const getStatusObj = (s) => {
  switch (s) {
    case 0:
      return {message: "... Pending", color: "#4a4a4a"}
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


export const RequestListItem = ({request, reload}) => {
  const {user} = useContext(UserContext)
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const ref = useRef()

  const acceptRequest = () => {
    fetch(`http://localhost:88/supplier/request/accept`, {
      method: 'POST',
      body: JSON.stringify({id: request._id, username: user.username, password: user.password}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then(rs=>{
      if(rs.error) {
        alert(rs.error);
      } else {
        setIsPopupOpen(false);
        reload();
      }
    })
  }

  const rejectRequest = () => {
    fetch(`http://localhost:88/supplier/request/reject`, {
      method: 'POST',
      body: JSON.stringify({id: request._id, username: user.username, password: user.password}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then(rs=>{
      if(rs.error) {
        alert(rs.error);
      } else {
        setIsPopupOpen(false);
        reload();
      }
    })
  }


  const status = getStatusObj(request.status);
  return <tr className='dashboardListItem' style={{cursor: request.status===0 ? "pointer" : null}} 
              onClick={()=>setIsPopupOpen(true)} onMouseLeave={()=>setIsPopupOpen(false)} ref={ref}>
    <td className='requestName'>
      {request.user.fullName}
    </td>
    <td className='requestPhone'>
      {formatPhoneNumber(request.user.phone)}
    </td>
    <td className='requestDate'>
      {new Date(request.date).toLocaleDateString()}
    </td>
    <td style={{color: status.color}} className='statusText'>
      {status.message}
    </td>
    <div className={'popup requestPopup ' + (isPopupOpen&&request.status===0 ? 'scale1' : '')}>
      <div className='arrowUp centerAbsolute'/>
      <h5 style={{margin: "5px"}}>Email: {request.user.email}</h5>
      <h5 style={{margin: "5px"}}>Request Description:</h5>
      <p className='requestDescription'>{request.description}</p>
      <div className='requestButtons'>
        <button className='button1 acceptButton' onClick={acceptRequest}>Accept</button>
        <button className='button1 rejectButton' onClick={rejectRequest}>Reject</button>
      </div>
    </div>
    
  </tr>
};

export const SupplierListItem = ({supplier, reload}) => {

  const changeUserStatus = () =>{
    if(window.confirm(`Are you sure you want to preform this action?`)) {
      fetch(`http://localhost:88/user/${supplier.suspended ? "restore" : "suspend"}`,{
        method: 'PUT',
        body: JSON.stringify({email: supplier.email}),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res=>res.json()).then(rs=>{
        if(rs.error)
          alert(rs.error);
        else
          reload();
      })
    }
  }

  return <tr className='dashboardListItem'>
    <td>
      {supplier.fullName}
    </td>
    <td>
      {formatPhoneNumber(supplier.phone)}
    </td>
    <td>
      {supplier.email}
    </td>
    <button className={'button1 rejectButton ' + (supplier.suspended ? '' : 'darkRedGradient')} onClick={changeUserStatus} style={{fontSize: "15px", width: "200px"}}>
      {supplier.suspended ? "Restore" : "Suspend"} Account
    </button>
  </tr>
}

export const MessageListItem = ({message, reload}) => {
  return <tr className='dashboardListItem'>
    <td>
      {message.to}
    </td>
    <td>
      {new Date(message.date).toLocaleDateString()}
    </td>
    <td>
      {message.subject}
    </td>
  </tr>
}