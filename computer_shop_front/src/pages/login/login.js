import React, { useContext, useState } from 'react'
import './login.css'
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../../UserContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {setUser} = useContext(UserContext);
  const navigate = useNavigate();

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  }
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const onSubmit = () => {
    fetch('http://localhost:88/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    }).then(res => res.json()).then(data => {
      console.log(data);
      if(data.error) {
        alert(data.error);
      } else {
        setUser(data);
        navigate('/');
        localStorage.setItem("username", data.username);
        localStorage.setItem("password", data.password)
      }
    })
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