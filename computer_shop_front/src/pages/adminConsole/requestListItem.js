import React, {useState, useRef} from 'react'
import { formatPhoneNumber } from '../../utils';

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


const RequestListItem = ({request}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const ref = useRef()

  const status = getStatusObj(request.status);
  return <div className='dashboardListItem' style={{cursor: request.status===0 ? "pointer" : null}} 
              onClick={()=>setIsPopupOpen(true)} onMouseLeave={()=>setIsPopupOpen(false)} ref={ref}>
    <div className='requestName'>
      {request.user.fullName}
    </div>
    <div className='requestPhone'>
      {formatPhoneNumber(request.user.phone)}
    </div>
    <div className='requestDate'>
      {new Date(request.date).toLocaleDateString()}
    </div>
    <div style={{color: status.color}} className='statusText'>
      {status.message}
    </div>
    <div className={'requestPopup ' + (isPopupOpen ? 'scale1' : '')}>
      <div className='arrowUp centerAbsolute'/>
      <h5 style={{margin: "5px"}}>Email: {request.user.email}</h5>
      <h5 style={{margin: "5px"}}>Request Description:</h5>
      <p className='requestDescription'>{request.description}</p>
      <div className='requestButtons'>
        <button className='button1 acceptButton'>Accept</button>
        <button className='button1 rejectButton'>Reject</button>
      </div>
    </div>
    
  </div>
};

export default RequestListItem;