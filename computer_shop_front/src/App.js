import './App.css';
import {Routes, Route, useLocation} from 'react-router-dom';
import Storefront from './pages/storefront/storefront';
import Login from './pages/login/login';
import Register from './pages/register/register';
import NewProduct from './pages/newProduct/newProduct';
import UserSettings from './pages/userSettings/userSettings';
import Cart from './pages/cart/cart';
import History from './pages/history/history';
import SearchScreen from  './pages/searchScreen/searchScreen';
import { useEffect, useState } from 'react';
import { MoneyContext, UserContext, TagsContext } from './Contexts';
import { NavBar } from './components/NavBar/NavBar';
import SupplierDashboard from './pages/supplierDashboard/supplierDashboard';
import AdminConsole from './pages/adminConsole/adminConsole';
import ProductPage from './pages/productPage/productPage';
import SupplierPage from './pages/supplierPage/supplierPage';
import ConfirmPurchase from './pages/confirmPurchase/confirmPurchase';

const App = () => {
  const [user, setUser] = useState({});
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const [tags, setTags] = useState([]);
  const location = useLocation();

  const login = () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    setCurrency(localStorage.getItem("currency") || 'USD');
    if(!email || !password){
      setUser({loggedOut: 1});
      return;
    }

    fetch(`${process.env.REACT_APP_SERVER_URL}/user/login`, {
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
    // fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.REACT_APP_MONEY_KEY}&currencies=ILS%2CUSD%2CAUD%2CBGN%2CBRL%2CCAD%2CCHF%2CCNY%2CCZK%2CDKK%2CEUR%2CGBP%2CHKD%2CHRK%2CHUF%2CIDR%2CILS%2CINR%2CISK%2CJPY%2CKRW%2CMXN%2CMYR%2CNOK%2CNZD%2CPHP%2CPLN%2CRON%2CRUB%2CSEK%2CSGD%2CTHB%2CTRY%2CUSD%2CZAR`).then(res => res.json()).then(data => {
    //   setExchangeRates(data.data)
    //   console.log(JSON.stringify(data.data))
    // }); TODO: change to actual data
    setExchangeRates(JSON.parse(`{"AUD":1.4813102151,"BGN":1.8009502854,"BRL":5.4574210894,"CAD":1.3639101385,"CHF":0.8953201338,"CNY":7.2620912501,"CZK":23.184832423,"DKK":6.8825011939,"EUR":0.9223501077,"GBP":0.7803700842,"HKD":7.8118514857,"HRK":6.6061807982,"HUF":362.8148426166,"IDR":16255.104380651,"ILS":3.6872503779,"INR":83.4515723513,"ISK":138.1419768938,"JPY":160.7413785363,"KRW":1375.2236080902,"MXN":18.0672732397,"MYR":4.709680858,"NOK":10.5429012047,"NZD":1.6266203052,"PHP":58.4587913451,"PLN":3.9476305555,"RON":4.5891105702,"RUB":88.0057837104,"SEK":10.4740714929,"SGD":1.3475802572,"THB":36.5403351143,"TRY":32.6427958961,"USD":1,"ZAR":18.2080529644}`))
    fetch(`${process.env.REACT_APP_SERVER_URL}/tag/get`).then((res) => res.json()).then((res) =>{
      setTags(res);
    });
  }, []);
  var MainPage = Storefront;

  if(user.level === 0||user.loggedOut) MainPage = Storefront;
  else if(user.level === 1) MainPage = SupplierDashboard;
  else if(user.level === 2) MainPage = AdminConsole;
  else MainPage = ()=>null;

  return (
      <UserContext.Provider value={{user, setUser}}>
        <MoneyContext.Provider value={{currency, setCurrency, exchangeRates}}>
          <TagsContext.Provider value={tags}>
            <div className="App">
              {location.pathname!=="/login"&&location.pathname!=="/register"&&<NavBar/>}
              <div className='mainWindow' style={location.pathname!=="/" ? {paddingTop: "50px"} : {}}>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/login" element={<Login/>} />
                  <Route path="/register" element={<Register />} />
                  {user.level===1&&<Route path="/product/new" element={<NewProduct />} />}
                  <Route path='/product/:productId' element={<ProductPage />} />
                  <Route path="/settings" element={<UserSettings />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/search" element={<SearchScreen />} />
                  <Route path="/supplier/:supplierId" element={<SupplierPage />} />
                  <Route path='/purchase/confirm' element={<ConfirmPurchase />} />
                  <Route path="*" element={<h1>Not Found</h1>} />
                </Routes>
              </div>
            </div>
          </TagsContext.Provider>
        </MoneyContext.Provider>
      </UserContext.Provider>
  );  
}

export default App;
