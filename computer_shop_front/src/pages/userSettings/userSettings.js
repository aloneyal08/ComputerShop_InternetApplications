import React, { useContext, useEffect, useState } from 'react'
import './userSettings.css'
import { validateEmail, validatePhone, validateUsername } from '../../utils';
import { UserContext } from '../../UserContext';

const UserSettings = () => {
  const {user} = useContext(UserContext);

  const [username, setUsername] = useState(user.username);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone||'');
  const [photo, setPhoto] = useState(user.profilePhoto||'');
  const [phoneValid, setPhoneValid] = useState(true);
  const [usernameValid, setUsernameValid] = useState(true);

  useEffect(()=>{
    setUsername(user.username);
    setFullName(user.fullName);
    setPhone(user.phone||'');
    setPhoto(user.profilePhoto||'');
  }, [user])


  const checkUsernameValid = () => setUsernameValid(validateUsername(username))
  const checkPhoneValid = () => setPhoneValid(validatePhone(phone) || phone === '');

  const onFullNameChange = (e) => setFullName(e.target.value);
  const onPhotoChange = (e) => setPhoto(e.target.value);
  const onRepeatPasswordChange = (e) => setRepeatPassword(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);
  const onOldPasswordChange = (e) => setOldPassword(e.target.value);
  const onPhoneChange = (e) => {
    setPhone(e.target.value);
    if(validatePhone(e.target.value)) {
      setPhoneValid(true);
    }
  }
  const onUsernameChange = (e) => {
    setUsername(e.target.value);
    if(validateUsername(e.target.value)) {
      setUsernameValid(true);
    }
  }

  const onProfileSubmit = () => {
    checkPhoneValid();
    if(!phoneValid) {
      alert('Invalid phone number');
      return;
    }


  }

  return <div>
    <div className='settingsHeader'>
      <img src={require("../../images/settings.png")} alt='_'/>
      <h1>Settings</h1>
    </div>
    <div className='settingsPart'>
      <h2>Profile</h2>
      <div className="input1">
        <label>
          <input type='text' required onChange={onFullNameChange} value={fullName}/>
          <span>Full Name*</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onBlur={checkPhoneValid} value={phone} onChange={onPhoneChange} className={phoneValid ? '' : 'invalidBox'}/>
          <span className={phoneValid ? '' : 'invalidText'}>{phoneValid ? 'Phone (10 digits)' : 'INVALID PHONE (10 digits)'}</span>
        </label>
      </div>
      <div className="input1 photoTextbox">
        <label>
          <input type='text' required onChange={onPhotoChange} value={photo}/>
          <span>Photo URL</span>
        </label>
        <img src={photo} alt='    ' className='photoPreview'/>
      </div>
      { ((fullName !== user.fullName) || (phone !== (user.phone||'')) || (photo !== (user.profilePhoto||'')))
       && <button className='button1'>Save</button>}
    </div>
    <div className='settingsPart'>
      <h2>Username</h2>
      <div className="input1">
        <label>
          <input type='text' required onChange={onUsernameChange} value={username} onBlur={checkUsernameValid} className={usernameValid ? '' : 'invalidBox'}/>
          <span className={usernameValid ? '' : 'invalidText'}>{usernameValid ? 'Username*' : 'INVALID USERNAME'}</span>
        </label>
      </div>
      {username !== user.username 
        && <button className='button1' style={{marginRight: "30px"}}>Save</button>}
    </div>
    <div className='settingsPart'>
      <h2>Password</h2>
      <div>
        <div className="input1">
          <label>
            <input type='password' required onChange={onOldPasswordChange}/>
            <span>Old Password*</span>
          </label>
        </div>
        <div className="input1">
          <label>
            <input type='password' required onChange={onPasswordChange}/>
            <span>New Password*</span>
          </label>
        </div>
        <div className="input1">
          <label>
            <input type='password' required onChange={onRepeatPasswordChange}/>
            <span>Repeat New Password*</span>
          </label>
        </div>
        { (oldPassword !== '' || password !== '' || repeatPassword !== '')
          && <button className='button1' style={{marginRight: "30px"}}>Save</button>}
      </div>
    </div>
  </div>
}

export default UserSettings;