import React, { useContext, useState } from 'react'
import './NavBar.css'
import { UserContext } from '../../UserContext';
import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAccountPopupOpen, setAccountPopupOpen] = useState(false);


  const onSearchChange = (e) => setSearch(e.target.value);
  const logOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    window.open("/", "_self")
  }
  const isUser = Object.keys(user).length === 0;

  var timeoutId;
  const leaveAccountIcon = () => {
    timeoutId = setTimeout(() => {
      setAccountPopupOpen(false)
    }, 100);
  }

  const open = (path) => {
    navigate(path);
    setAccountPopupOpen(false);
  }

  return <div className='navBar'>
    <div className='mainBar'>
      <div className='logo' onClick={()=>navigate("/")}>
        <h1>SHOP</h1>
      </div>
      <input type='text' className='searchBox' onChange={onSearchChange} placeholder='Search...' value={search}/>
      <div className='navBarOthers'>
        <div className='nbImageContainer' onMouseEnter={()=>setAccountPopupOpen(true)} onMouseLeave={leaveAccountIcon}>
          <img src={user.profilePhoto} alt='' className='navBarPhoto navBarAccountPhoto' style={{zIndex: 2}}/>
          <img 
            src='https://www.sunsetlearning.com/wp-content/uploads/2019/09/User-Icon-Grey-300x300.png' 
            alt='' className='navBarPhoto navBarAccountPhoto' 
            style={{zIndex: 1}}
          />
        </div>
        <div className='cart' onClick={()=>navigate("/cart")}>
          <div className='shopCartNumber'>0</div>
          <img src={require("../../images/cart.png")} className='navBarPhoto' alt='  '/>
        </div>
      </div>
    </div>
    {1 &&
      <div 
        className={'accountPopup ' + (isAccountPopupOpen ? 'scale1' : '')}
        onMouseEnter={()=>clearTimeout(timeoutId)} onMouseLeave={()=>setAccountPopupOpen(false)}
      >
        <div className='arrowUp'/>
        <h3>{user.email}</h3>
        <div style={{marginTop: "15px", height: "80px"}}>
          <img src={user.profilePhoto} alt='' className='photoPreview navBarAccountPhoto' style={{zIndex: 2}}/>
          <img 
            src='https://www.sunsetlearning.com/wp-content/uploads/2019/09/User-Icon-Grey-300x300.png' 
            alt='' 
            className='photoPreview navBarAccountPhoto' 
            style={{zIndex: 1}}
          />
        </div>
        <h1>Hello, {user.fullName||"Guest"}</h1>
        <div className='accountPopupButtons'>
          {isUser
            ?<>
              <button className='accountButton' onClick={()=>open("/login")}>Log in</button>
              <button className='accountButton' onClick={()=>open("/register")}>Register</button>
            </>
            :<>
              <button className='accountButton' onClick={()=>open("/settings")}>Settings</button>
              <button className='accountButton' onClick={()=>open("/cart")}>Cart</button>
              <button className='accountButton' onClick={()=>open("/history")}>History</button>
              <button className='accountButton' style={{width: "150px"}} onClick={logOut}>Log out</button>
            </>
          }
        </div>
      </div> 
    }
  </div>
}