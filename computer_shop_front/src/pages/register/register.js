import React, { useContext, useEffect, useState } from 'react'
import { validateEmail, validatePhone } from '../../utils';
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

export const googleRegister = (user, setUser, navigate) => {
  fetch('http://localhost:88/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: user.email.split('@')[0],
      password: user.id,
      email: user.email,
      fullName: user.name,
      phone: '0000000000',
      profilePhoto: user.picture
    })
  }).then((res) => res.json()).then((res) => {
    if(res.error) {
      alert(res.error);
    } else {
      setUser(res);
      navigate('/');
      localStorage.setItem("username", res.username);
      localStorage.setItem("password", res.password)
    }
  })
}

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [googleUser, setGoogleUser] = useState(null);

  const {setUser} = useContext(UserContext);
  const navigate = useNavigate();

  const checkEmailValid = () => setEmailValid(validateEmail(email))
  const checkPhoneValid = () => setPhoneValid(validatePhone(phone));

  const onUsernameChange = (e) => setUsername(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);
  const onFullNameChange = (e) => setFullName(e.target.value);
  const onRepeatPasswordChange = (e) => setRepeatPassword(e.target.value);
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if(validateEmail(e.target.value)) {
      setEmailValid(true);
    }
  }
  const onPhoneChange = (e) => {
    setPhone(e.target.value);
    if(validatePhone(e.target.value)) {
      setPhoneValid(true);
    }
  }

  const onSubmit = () => {
    checkEmailValid(email);
    if(!emailValid) {
      alert('Invalid email');
      return;
    }
    if(password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    if(!username || !password || !email || !fullName || !phone) {
      alert('Please fill all fields');
      return;
    }
    if(username.includes('@')) {
      alert('Username cannot contain @');
      return;
    }
  
    fetch('http://localhost:88/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        email,
        fullName,
        phone,
        profilePhoto: ''
      })
    }).then((res) => res.json()).then((res) => {
      if(res.error) {
        alert(res.error);
      } else {
        setUser(res);
        navigate('/');
        localStorage.setItem("username", res.username);
        localStorage.setItem("password", res.password)
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
        googleRegister(user, setUser, navigate);
      }
    }
    fetchData();
  }, [googleUser, navigate, setUser]);

  return <div>
    <div className='loginForm'>
      <h1>Register</h1>
      <div className="input1">
        <label>
          <input type='text' required onChange={onFullNameChange}/>
          <span>Full Name*</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onChange={onEmailChange} onBlur={checkEmailValid} className={emailValid ? '' : 'invalidBox'}/>
          <span className={emailValid ? '' : 'invalidText'}>{emailValid ? 'Email*' : 'INVALID EMAIL*'}</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onBlur={checkPhoneValid} onChange={onPhoneChange} className={phoneValid ? '' : 'invalidBox'}/>
          <span className={phoneValid ? '' : 'invalidText'}>{phoneValid ? 'Phone* (10 digits)' : 'INVALID PHONE* (10 digits)'}</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onChange={onUsernameChange}/>
          <span>Username*</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='password' required onChange={onPasswordChange}/>
          <span>Password*</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='password' required onChange={onRepeatPasswordChange}/>
          <span>Repeat Password*</span>
        </label>
      </div>
      <button onClick={onSubmit} className='loginSubmit button1'>Register</button>
      <span className='loginOr'>--------- or -----------</span>
      <button className='button1 googleButton' onClick={googleLogin} >
        <img src={require('../../images/googleIcon.png')} alt='_' className='googleIcon'/>
        Continue with Google
      </button>
    </div>
  </div>
}

export default Register;