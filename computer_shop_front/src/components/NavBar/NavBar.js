import React, { useContext, useEffect, useState } from 'react'
import './NavBar.css'
import { MoneyContext, UserContext } from '../../Contexts';
import { useNavigate } from "react-router-dom";
const currencies = require('../../currencies.json')

const searchOptions = [
  {
    text: "New",
    searchKey: "::recent:1",
    special: 1
  },
  {
    text: "On Sale",
    searchKey: "::discount:>0",
    special: 1
  },
  {
    text: "Prices under 50$",
    searchKey: "::price:<50",
    special: 1
  }
]

const tags = ["Laptop", "PC", "Gaming", "Mouse", "Keyboard", "Office"] //TODO: Yaniv's tags

export const NavBar = () => {
  const {user} = useContext(UserContext);
  const {currency, setCurrency} = useContext(MoneyContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [isAccountPopupOpen, setAccountPopupOpen] = useState(false);
  const [isCurrencyPopupOpen, setCurrencyPopupOpen] = useState(false);

  const onSearchChange = (e) => setSearch(e.target.value);
  const logOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    window.open("/", "_self")
  }
  const isNoUser = Object.keys(user).length === 0 || user.loggedOut;

  var timeoutId;
  const leaveAccountIcon = () => {
    timeoutId = setTimeout(() => {
      setAccountPopupOpen(false)
    }, 100);
  }
  useEffect(()=>setCurrencyPopupOpen(false), [isAccountPopupOpen])

  const open = (path) => {
    navigate(path);
    setAccountPopupOpen(false);
  }

  const pickCurr = (curr) => {
    setCurrency(curr);
    setCurrencyPopupOpen(false);
  }

  const tagOptions = tags.map(t=>({text: t, searchKey: `::tags:${t}`}))

  return <header className='navBar'>
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
        <div className='currOptionNavBar' onClick={()=>setCurrencyPopupOpen(!isCurrencyPopupOpen)}>
          <div className={'arrowDown ' + (isCurrencyPopupOpen ? 'rotated' : '')}/>
          <h3>{currencies[currency].symbol}<br/><div style={{fontSize: "12.5px"}}>{currency}</div></h3>
        </div>
      </div>
    </div>
    <div className='specialSearch'>
      {
        searchOptions.concat(tagOptions).map(option=>(
          <button className={'searchOption ' + (option.special ? 'optionSpecial' : '')} onClick={()=>navigate(`/search?key=${option.searchKey}`)}>
            {option.text}
          </button>
        ))
      }
    </div>
    <div 
      className={'navBarPopup ' + (isAccountPopupOpen ? 'scale1' : '')}
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
        {isNoUser
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
    {isCurrencyPopupOpen && <div className='allScreen' onClick={()=>setCurrencyPopupOpen(false)}/>}
    <div 
      className={'navBarPopup currPopup ' + (isCurrencyPopupOpen ? 'scale1' : '')}
    >
      {
        Object.keys(currencies).map(curr=>
          <div className='currOption' onClick={()=>pickCurr(curr)}>
            <div>{currencies[curr].symbol}</div>
            <span style={currency===curr ? {fontWeight: "bold"} : {}}>{currencies[curr].name}</span>
          </div>
        )
      }
    </div>
  </header>
}