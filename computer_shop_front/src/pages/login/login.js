import React, { useContext, useEffect, useState } from 'react'
import './login.css'
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../../Contexts';
import { useGoogleLogin } from '@react-oauth/google';
import { googleRegister } from '../register/register';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [googleUser, setGoogleUser] = useState(null);

  const {setUser, user} = useContext(UserContext);
  const navigate = useNavigate();

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  }
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  }
  useEffect(()=>{
    if(Object.keys(user).length !== 0 && !user.loggedOut)
      navigate("/")
  }, [navigate, user])

  const onSubmit = () => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
      })
    }).then(res => res.json()).then(data => {
      if(data.error) {
        alert(data.error);
      } else {
        setUser(data);
        navigate('/');
        localStorage.setItem("email", data.email);
        localStorage.setItem("password", data.password)
      }
    })
  }

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => setGoogleUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(() => {
    async function fetchData() {
      if (googleUser) {
        const response = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${googleUser.access_token}` },
          }
        );
        const user = await response.json();
        fetch(`${process.env.REACT_APP_SERVER_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: user.email,
            password: user.id,
            encrypted: true
          })
        }).then(res => res.json()).then(data => {
          if(data.error) {
            googleRegister(user, setUser, navigate);
          } else {
            setUser(data);
            navigate('/');
            localStorage.setItem("email", data.email);
            localStorage.setItem("password", data.password)
          }
        })
      }
    }
    fetchData();
  }, [googleUser, navigate, setUser]);

  if(Object.keys(user).length === 0)
    return null;

  return <div>
    <div className='loginForm'>
      <h1>Login</h1>
      <div className="input1">
        <label>
          <input type='text' required onChange={onUsernameChange}/>
          <span>Username / Email</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='password' required onChange={onPasswordChange}/>
          <span>Password</span>
        </label>
      </div>
      <button onClick={onSubmit} className='button1'>Login</button>
      <span className='loginOr'>--------- or -----------</span>
      <button className='button1 googleButton' onClick={googleLogin} >
        <img src={require('../../images/googleIcon.png')} alt='_' className='googleIcon'/>
        Continue with Google
      </button>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  </div>
}

export default Login;