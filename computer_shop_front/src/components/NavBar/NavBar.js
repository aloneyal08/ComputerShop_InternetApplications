import React, { useContext, useEffect, useRef, useState } from 'react'
import './NavBar.css'
import { MoneyContext, TagsContext, UserContext } from '../../Contexts';
import { useLocation, useNavigate } from "react-router-dom";
const currencies = require('../../currencies.json')

const searchOptions = [
  {
    text: "New",
    searchKey: "::sort=5",
    special: 1
  },
  {
    text: "On Sale",
    searchKey: "::discount=1",
    special: 1
  },
  {
    text: "Prices under 50$",
    searchKey: "::price=<50",
    special: 1
  }
]

export const NavBar = () => {
  const {user} = useContext(UserContext);
  const {currency, setCurrency} = useContext(MoneyContext);
  const tags = useContext(TagsContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const location = useLocation();
  const arrowRef = useRef(null);

  const [isAccountPopupOpen, setAccountPopupOpen] = useState(false);
  const [isCurrencyPopupOpen, setCurrencyPopupOpen] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const [selectIndex, setSelectIndex] = useState(-1);
  const [autoCompletes, setAutoCompletes] = useState([]);

  const getAutoCompletes = (search) => {
    fetch('http://localhost:88/product/autocomplete', {
      method: 'GET',
      headers: {
        key: search.toLowerCase()
      }
    }).then(res=>res.json()).then(res=>setAutoCompletes(res));
  }

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    getAutoCompletes(e.target.value);
  }
  const logOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate(0);
  }
  const isNoUser = Object.keys(user).length === 0 || user.loggedOut;

  var timeoutId;
  const leaveAccountIcon = () => {
    timeoutId = setTimeout(() => {
      setAccountPopupOpen(false)
    }, 100);
  }
  useEffect(()=>setCurrencyPopupOpen(false), [isAccountPopupOpen])
  useEffect(()=>{
    getAutoCompletes('');
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key')||'';
    setSearch(key.split("::")[0]);

    var canvas = arrowRef.current;
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');

      var sWidth = canvas.width;
      var sHeight = canvas.height;
      ctx.fillStyle = "white";
      var path=new Path2D();
      path.moveTo(sWidth, 0);
      path.lineTo((sWidth/2),sHeight);
      path.lineTo(0,0);
      ctx.fill(path);
      
  }
  }, [])

  const open = (path) => {
    navigate(path);
    setAccountPopupOpen(false);
  }

  const pickCurr = (curr) => {
    setCurrency(curr);
    localStorage.setItem("currency", curr);
    setCurrencyPopupOpen(false);
  }

  useEffect(()=> {
    if(selectIndex===-1) return;
    setSearch(autoCompletes[selectIndex]);
  }, [autoCompletes, selectIndex])

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      window.open(`/search?key=${search}`, "_self");
    }
    else if (e.key === "ArrowDown") {
      setSelectIndex(selectIndex+1);
      if(selectIndex > autoCompletes)
        setSelectIndex(0);
    }
    else if (e.key === "ArrowUp") {
      setSelectIndex(selectIndex-1);
      if(selectIndex < 0)
        setSelectIndex(autoCompletes.length-1);
    } else {
      setSelectIndex(-1);
    }
  }

  const tagOptions = tags.map(t=>({text: t.text, searchKey: `::tags=${t.text}`}))

  return <header className='navBar' style={location.pathname !== "/" || user.level === 1 || user.level === 2 ? {height: "50px"} : {}}>
    <div className='mainBar'>
      <div className='logo' onClick={()=>navigate("/")}>
        <h1>SHOP</h1>
      </div>
      {(user.level===0||!user.level)&&<div className='searchArea'>
        <input 
          type='text' className='searchBox' onChange={onSearchChange} 
          placeholder='Search...' value={search} onKeyDown={onKeyDown}
          onFocus={()=>{setFocused(true);setSelectIndex(-1)}} 
          onBlur={()=>setFocused(false)}
        />
        <div className={'autoCompletes roundBorderBottom ' + (isFocused ? 'fullScaleComplete' : '')}>
          {
            autoCompletes.map((complete, i)=>(
              <div className={'autoCompleteItem ' + (i===autoCompletes.length-1 ? 'roundBorderBottom' : '')} 
                style={{backgroundColor: i===selectIndex ? "#cccccc" : "white"}}
                onMouseDown={()=>{window.open(`/search?key=${complete}`, "_self")}} key={i}
              >
                {complete}
              </div>
            ))
          }
        </div>
      </div>}
      <div className='navBarOthers'>
        <div className='nbImageContainer' onMouseEnter={()=>setAccountPopupOpen(true)} onMouseLeave={leaveAccountIcon}>
          <img src={user.profilePhoto} alt='' className='navBarPhoto navBarAccountPhoto' style={{zIndex: 2}}/>
          <img 
            src={require('../../images/userDefault.png')} 
            alt='' className='navBarPhoto navBarAccountPhoto' 
            style={{zIndex: 1}}
          />
        </div>
        {user.level === 1
          ? <button className='addProduct' onClick={()=>navigate("/product/new")}/>
          : <div className='cart' onClick={()=>navigate("/cart")}>
          <div className='shopCartNumber'>0</div>
          <img src={require("../../images/cart.png")} className='navBarPhoto' alt='  '/>
        </div>
        }
        <div className='currOptionNavBar' onClick={()=>setCurrencyPopupOpen(!isCurrencyPopupOpen)}>
          <canvas className={'arrowCanvas ' + (isCurrencyPopupOpen ? 'rotated' : '')} ref={arrowRef}/>
          <h3>{currencies[currency].symbol}<br/><div style={{fontSize: "12.5px"}}>{currency}</div></h3>
        </div>
      </div>
    </div>
    {location.pathname === "/" && user.level !== 1 && user.level !== 2 && <div className='specialSearchCon'>
          <nav className='specialSearch'>
          {
            searchOptions.concat(tagOptions).map(option=>(
              <button className={'searchOption ' + (option.special ? 'optionSpecial' : '')} onClick={()=>window.open(`/search?key=${option.searchKey}`, '_self')} key={option.text}>
                {option.text}
              </button>
            ))
          }
        </nav>
      </div>}
    <div 
      className={'popup navBarPopup ' + (isAccountPopupOpen ? 'scale1' : '')}
      onMouseEnter={()=>clearTimeout(timeoutId)} onMouseLeave={()=>setAccountPopupOpen(false)}
    >
      <div className='arrowUp'/>
      <h3>{user.email}</h3>
      <div style={{marginTop: "15px", height: "80px"}}>
        <img src={user.profilePhoto} alt='' className='photoPreview navBarAccountPhoto' style={{zIndex: 2}}/>
        <img 
          src={require('../../images/userDefault.png')}
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
            {user.level === 1
             ?<>
              <button className='accountButton' onClick={()=>open("/products")}>Products</button>
              <button className='accountButton' onClick={()=>open("/statistics")}>Statistics</button>
             </>
             :user.level === 0
              ? <>
                <button className='accountButton' onClick={()=>open("/cart")}>Cart</button>
                <button className='accountButton' onClick={()=>open("/history")}>History</button>
              </>
              : null
            }
            <button className='accountButton' style={{width: "150px"}} onClick={logOut}>Log out</button>
          </>
        }
      </div>
    </div>
    {isCurrencyPopupOpen && <div className='allScreen' onClick={()=>setCurrencyPopupOpen(false)}/>}
    <div 
      className={'popup currPopup ' + (isCurrencyPopupOpen ? 'scale1' : '')}
    >
      {
        Object.keys(currencies).map(curr=>
          <div className='currOption' onClick={()=>pickCurr(curr)} key={curr}>
            <div>{currencies[curr].symbol}</div>
            <span style={currency===curr ? {fontWeight: "bold"} : {}}>{currencies[curr].name}</span>
          </div>
        )
      }
    </div>
  </header>
}