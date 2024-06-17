import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Storefront from './pages/storefront/storefront';
import Login from './pages/login/login';
import Register from './pages/register/register';
import NewProduct from './pages/newProduct/newProduct';
import UserSettings from './pages/userSettings/userSettings';
import Cart from './pages/cart/cart';
import { useEffect, useState } from 'react';
import { UserContext } from './UserContext';

const App = () => {
  const [user, setUser] = useState(null);

  const login = () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if(!username || !password) return;

    fetch('http://localhost:88/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        encrypted: true
      })
    }).then(res => res.json()).then(data => {
      console.log(data);
      if(!data.error) {
        setUser(data);
      }
    })
  }

  useEffect(() => {
    login();
  }, []);

  return (
    <BrowserRouter>
      <UserContext.Provider value={{user, setUser}}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/new" element={<NewProduct />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
