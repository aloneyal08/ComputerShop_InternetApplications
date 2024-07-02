import React, {useState, useEffect} from 'react'
import './adminConsole.css'
import {AdminListItem, MessageListItem, RequestListItem, SupplierListItem, TagListItem} from './listItem';
import CreateMessage from './createMessage';
import CreateAdmin from './createAdmin';
import CreateTag from './createTag';


const AdminConsole = () => {
  const [requests, setRequests] = useState([]);
  const [force,update] = useState(0);
  const reload = () => update(Math.random());

  const [suppliers, setSuppliers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:88/supplier/request`).then(res=>res.json()).then(req=>{
      setRequests(req);
    });
    fetch(`http://localhost:88/user/suppliers`).then(res=>res.json()).then(s=>{
      setSuppliers(s);
    });
    fetch(`http://localhost:88/message/`).then(res=>res.json()).then(m=>{
      setMessages(m);
    });
    fetch(`http://localhost:88/user/admins`).then(res=>res.json()).then(a=>{
      setAdmins(a);
    });
    fetch(`http://localhost:88/tag/get`).then(res=>res.json()).then(t=>{
      setTags(t);
    });
  }, [force])

  return <div>
    <h1>Admin Console</h1>
    <div className='dashboard'>
      <div className='dashboardContainer'>
        <h2 className='dashboardHeader'>Supplier Requests</h2>
        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader'>
                <th>Company Name</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
              {
                requests.map((request, i)=><RequestListItem request={request} key={i} reload={reload}/>)
              }
            </tbody>
          </table>
          {requests.length===0&&<h3>No Requests</h3>}
        </div>
      </div>
      <div className='dashboardContainer'>
        <h2 className='dashboardHeader'>Suppliers</h2>
        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "#b59c9c"}}>
                <th style={{backgroundColor: "#b59c9c"}}>Company Name</th>
                <th style={{backgroundColor: "#b59c9c"}}>Phone</th>
                <th style={{backgroundColor: "#b59c9c"}}>Email</th>
                <th style={{backgroundColor: "#b59c9c"}}>Action</th>
              </tr>
              {
                suppliers.map((supplier, i)=><SupplierListItem supplier={supplier} key={i} reload={reload}/>)
              }
            </tbody>
          </table>
          {suppliers.length===0&&<h3>No Suppliers</h3>}
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
                <th style={{backgroundColor: "white"}}>To</th>
                <th style={{backgroundColor: "white"}}>Subject</th>
                <th style={{backgroundColor: "white"}}>Date</th>
              </tr>
              {
                messages.map((message, i)=><MessageListItem message={message} key={i} reload={reload}/>)
              }
            </tbody>
          </table>
          {messages.length===0&&<h3>No Messages</h3>}
        </div>
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Admins</h2>
          <CreateAdmin reload={reload}/>
        </div>

        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "black", color: "white"}}>
                <th style={{backgroundColor: "black"}}>Name</th>
                <th style={{backgroundColor: "black"}}>Email</th>
                <th style={{backgroundColor: "black"}}>Phone</th>
                <th style={{backgroundColor: "black"}}> </th>
              </tr>
              {
                admins.map((admin, i)=><AdminListItem admin={admin} key={i} reload={reload}/>)
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className='dashboardContainer'>
        <div className='dashboardHeaderContainer' style={{position: "relative"}}>
          <h2 className='dashboardHeader'>Tags</h2>
          <CreateTag reload={reload}/>
        </div>

        <div className='dashboardList'>
          <table>
            <tbody>
              <tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "#a7c9ba"}}>
                <th style={{backgroundColor: "#a7c9ba"}}>Text</th>
                <th style={{backgroundColor: "#a7c9ba"}}>Background</th>
                <th style={{backgroundColor: "#a7c9ba"}}> </th>
              </tr>
              {
                tags.map((tag, i)=><TagListItem tag={tag} key={i} reload={reload}/>)
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
}

export default AdminConsole;