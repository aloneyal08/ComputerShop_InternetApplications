import React, { useState } from 'react'
import './login.css'
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  }
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const onSubmit = () => {
    console.log(username, password);
  }

  return <div>
    <div className='loginForm'>
      <h1>Login</h1>
      <div class="input1">
        <label>
          <input type='text' required onChange={onUsernameChange}/>
          <span>Username / Email</span>
        </label>
      </div>
      <div class="input1">
        <label>
          <input type='password' required onChange={onPasswordChange}/>
          <span>Password</span>
        </label>
      </div>
      <button onClick={onSubmit} className='loginSubmit button1'>Login</button>
      <span className='loginOr'>--------- or -----------</span>
      <button className="button1">Continue with Google</button>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  </div>
}

export default Login;