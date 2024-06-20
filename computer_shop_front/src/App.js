import './App.css';
import {Routes, Route, useLocation} from 'react-router-dom';
import Storefront from './pages/storefront/storefront';
import Login from './pages/login/login';
import Register from './pages/register/register';
import NewProduct from './pages/newProduct/newProduct';
import UserSettings from './pages/userSettings/userSettings';
import Cart from './pages/cart/cart';
import { useEffect, useState } from 'react';
import { MoneyContext, UserContext } from './Contexts';
import { NavBar } from './components/NavBar/NavBar';

const App = () => {
  const [user, setUser] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const location = useLocation();

  const login = () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    if(!email || !password){
      setUser({loggedOut: 1});
      return;
    }

    fetch('http://localhost:88/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password,
        encrypted: true
      })
    }).then(res => res.json()).then(data => {
      //console.log(data);
      if(!data.error) {
        setUser(data);
      } else {
        setUser({loggedOut: 1});
      }
    })
  }

  useEffect(() => {
    login();
    fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.REACT_APP_MONEY_KEY}&currencies=ILS%2CUSD%2CAUD%2CBGN%2CBRL%2CCAD%2CCHF%2CCNY%2CCZK%2CDKK%2CEUR%2CGBP%2CHKD%2CHRK%2CHUF%2CIDR%2CILS%2CINR%2CISK%2CJPY%2CKRW%2CMXN%2CMYR%2CNOK%2CNZD%2CPHP%2CPLN%2CRON%2CRUB%2CSEK%2CSGD%2CTHB%2CTRY%2CUSD%2CZAR`).then(res => res.json()).then(data => {
      setExchangeRates(data.data)
    });
  }, []);

  return (
      <UserContext.Provider value={{user, setUser}}>
        <MoneyContext.Provider value={{currency, setCurrency, exchangeRates}}>
          <div className="App">
            {location.pathname!=="/login"&&location.pathname!=="/register"&&<NavBar/>}
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
        </MoneyContext.Provider>
      </UserContext.Provider>
  );
}

export default App;
