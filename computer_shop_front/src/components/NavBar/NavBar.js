import React, { useContext, useState } from 'react'
import './NavBar.css'
import { UserContext } from '../../UserContext';

export const NavBar = () => {
  const {user} = useContext(UserContext);
  const [serach, setSearch] = useState('');

  const onSearchChange = (e) => setSearch(e.target.value);

  return <div className='navBar'>
    <div className='mainBar'>
      <div className='logo'>
        <h1>SHOP</h1>
      </div>
      <input type='text' className='searchBox' onChange={onSearchChange} placeholder='Search...'/>
      <div className='navBarOthers'>
        <div className='nbImageContainer'>
          <img src={user.profilePhoto} alt='    ' className='photoPreview navBarPhoto' style={{zIndex: 2}}/>
          <img src='https://www.sunsetlearning.com/wp-content/uploads/2019/09/User-Icon-Grey-300x300.png' alt='    ' className='photoPreview navBarPhoto' style={{zIndex: 1}}/>
        </div>
        <div className='cart'>
          <div className='shopCartNumber'>0</div>
          <img src={require("../../images/cart.png")} className='navBarPhoto' alt='  '/>
        </div>
      </div>
    </div>
  </div>
}