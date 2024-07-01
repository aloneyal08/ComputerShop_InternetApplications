import React, { useState, useEffect, useContext } from 'react'
import SelectSearch from 'react-select-search';
import { UserContext } from '../../Contexts';

const CreateAdmin = ({reload}) => {
  const {user} = useContext(UserContext);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
 
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:88/user/emails?onlyUser=1').then((res) => res.json()).then((res) =>{
      setEmails(res);
    });
  }, [])

  const onEmailChange = (e) => setEmail(e);

  const onSubmit = () => {
    fetch(`http://localhost:88/user/admin/add`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, username: user.username, password: user.password})
    }).then(res=>res.json()).then(res=>{
      if(res.error) {
        alert(res.error);
      } else {
        reload();
        setIsPopupOpen(false);
      }
    })
  }

  return <div>
    <button className='button1' onClick={()=>setIsPopupOpen(!isPopupOpen)} style={{width: "200px"}}>
      {isPopupOpen ? '- Close' : '+ Create Admin'}
    </button>
    {isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
    <div className={'popup messagePopup adminPopup ' + (isPopupOpen ? 'scale1' : '')}>
      <div className='arrowUp'/>
      <h2>Add Admin</h2>
      {emails.length>0&&<SelectSearch onChange={onEmailChange} value={email} search={true} getOptions={()=>emails.map(email=>({value: email, name: email}))} placeholder="User Email" renderValue={(valueProps) =>
      <div className='input1'>
        <label>
        <input type='text' required {...valueProps} placeholder=''/>
        <span>{valueProps.placeholder}</span>
        </label>
      </div>} renderOption={(optionsProps, optionsData) => {
          return <button className='select-search-option' {...optionsProps}>{optionsData.value}</button>
      }} />}
      <button className='button1' onClick={onSubmit}>Create</button>
    </div>
  </div>
}

export default CreateAdmin;