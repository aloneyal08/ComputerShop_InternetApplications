import React, { useState } from 'react'

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const onUsernameChange = (e) => setUsername(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);
  const onEmailChange = (e) => setEmail(e.target.value);
  const onFullNameChange = (e) => setFullName(e.target.value);
  const onPhoneChange = (e) => setPhone(e.target.value);
  const onRepeatPasswordChange = (e) => setRepeatPassword(e.target.value);

  const onSubmit = () => {
    if(password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }

    fetch('http://localhost:88/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        email,
        fullName,
        phone
      })
    }).then((res) => res.json()).then((res) => {
      if(res.error) {
        alert(res.error);
      } else {
        alert('Successfully registered');
      }
    })
    
  }

  return <div>
    <div className='loginForm'>
      <h1>Register</h1>
      <div class="input1">
        <label>
          <input type='text' required onChange={onFullNameChange}/>
          <span>Full Name</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='text' required onChange={onEmailChange}/>
          <span>Email</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='text' required onChange={onPhoneChange}/>
          <span>Phone</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='text' required onChange={onUsernameChange}/>
          <span>Username</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='password' required onChange={onPasswordChange}/>
          <span>Password</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='password' required onChange={onRepeatPasswordChange}/>
          <span>Repeat Password</span>
        </label>
      </div>
      <button onClick={onSubmit} className='loginSubmit button1'>Register</button>
      <span className='loginOr'>--------- or -----------</span>
      <button className="button1">Continue with Google</button>
    </div>
  </div>
}

export default Register;