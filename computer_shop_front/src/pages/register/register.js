import React, { useContext, useEffect, useState } from 'react'
import { validateEmail, validatePhone, validateUsername } from '../../utils';
import { UserContext } from '../../Contexts';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './register.css';

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
      phone: null,
      profilePhoto: user.picture,
      google: true
    })
  }).then((res) => res.json()).then((res) => {
    if(res.error) {
      alert(res.error);
    } else {
      setUser(res);
      navigate('/');
      localStorage.setItem("email", res.email);
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
  const [usernameValid, setUsernameValid] = useState(true);

  const [isSupplier, setIsSupplier] = useState(false);
  const [description, setDescription] = useState('');


  const {setUser, user} = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(()=>{
    if(Object.keys(user).length !== 0 && !user.loggedOut)
      navigate("/")
  }, [navigate, user])

  const checkEmailValid = () => setEmailValid(validateEmail(email))
  const checkUsernameValid = () => setUsernameValid(validateUsername(username))
  const checkPhoneValid = () => setPhoneValid(validatePhone(phone) || phone === '')

  const onFullNameChange = (e) => setFullName(e.target.value);
  const onDescriptionChange = (e) => setDescription(e.target.value);
  const onRepeatPasswordChange = (e) => setRepeatPassword(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if(validateEmail(e.target.value) || e.target.value === '') {
      setEmailValid(true);
    }
  }
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

  const onSubmit = () => {
    checkEmailValid();
    checkUsernameValid();
    checkPhoneValid();
    if(!emailValid) {
      alert('Invalid email');
      return;
    }
    if(!phoneValid) {
      alert('Invalid phone');
      return;
    }
    if(phone === '' && isSupplier) {
      alert('Phone is required for suppliers');
      return;
    }
    if(!usernameValid) {
      alert('Invalid username');
      return;
    }
    if(password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    if(!username || !password || !email || !fullName) {
      alert('Please fill all required fields');
      return;
    }
    if(username.includes('@')) {
      alert('Username cannot contain @');
      return;
    }
    
    
    fetch(`http://localhost:88/${isSupplier ? 'supplier/request/create' : 'user/register'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        email,
        fullName,
        description,
        phone: phone === '' ? null : phone,
      })
    }).then((res) => res.json()).then((res) => {
      if(res.error) {
        alert(res.error);
      } else {
        if(isSupplier)
          alert('Your request has been sent to our admin. once approved, you will be able to start selling on our site!');
        else
          setUser(res);
        navigate('/');
        localStorage.setItem("email", res.email);
        localStorage.setItem("password", res.password);
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

  if(Object.keys(user).length === 0)
    return null;

  return <div>
    <div className='loginForm'>
      <h1>Register</h1>
      <div className="input1">
        <label>
          <input type='text' required onChange={onFullNameChange}/>
          <span>{isSupplier ? 'Company name' : 'Full Name'}*</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onChange={onEmailChange} onBlur={checkEmailValid} className={emailValid ? '' : 'invalidBox'}/>
          <span className={emailValid ? '' : 'invalidText'}>{emailValid ? `Email* ${isSupplier ? '(Contact)' : ''}` : 'INVALID EMAIL*'}</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onBlur={checkPhoneValid} onChange={onPhoneChange} className={phoneValid ? '' : 'invalidBox'}/>
          <span className={phoneValid ? '' : 'invalidText'}>{phoneValid ? `Phone ${isSupplier ? '(Contact)' : ''} (10 digits)` : 'INVALID PHONE (10 digits)'}</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' required onChange={onUsernameChange} onBlur={checkUsernameValid} className={usernameValid ? '' : 'invalidBox'}/>
          <span className={usernameValid ? '' : 'invalidText'}>{usernameValid ? 'Username*' : 'INVALID USERNAME*'}</span>
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
      {isSupplier && <div>
        <div className="input1">
          <label>
            <textarea required onChange={onDescriptionChange}/>
            <span>Description (what are you selling? what volume?)</span>
          </label>
        </div>
      </div>}
      <div className="checkbox1 supplierCheckbox">
        <input id="supplierCheck" className="substituted" type="checkbox" aria-hidden="true" onChange={()=>setIsSupplier(!isSupplier)}/>
        <label htmlFor="supplierCheck">Request to be a supplier</label>
      </div>
      <button onClick={onSubmit} className='button1'>Register</button>
      {!isSupplier && <>
        <span className='loginOr'>--------- or -----------</span>
        <button className='button1 googleButton' onClick={googleLogin} >
          <img src={require('../../images/googleIcon.png')} alt='_' className='googleIcon'/>
          Continue with Google
        </button>
      </>
      }
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  </div>
}

export default Register;