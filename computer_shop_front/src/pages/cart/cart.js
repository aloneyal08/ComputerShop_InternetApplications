import React, {useContext, useState, useEffect} from 'react'
import {UserContext} from '../../Contexts'
import {useNavigate} from 'react-router-dom';
import CartItem from './cartItem';
import './cart.css'

const Cart = () => {
  const {user, setUser} = useContext(UserContext);

  const [itemsChanged, setItemsChanged] = useState([]);
  const [itemsDeleted, setItemsDeleted] = useState([]);
  const [changed, setChanged] = useState(false)
  const [newCart, setNewCart] = useState([]);

  const navigate = useNavigate();
  
  const buyCart = () => {

  };

  const saveCart = () => {
    let save = [];
    newCart.forEach((item) => {
      if(!item.deleted){
        save.push(item);
      }
    });
    fetch(`${process.env.REACT_APP_SERVER_URL}/user/update/cart`, {
		  method: 'PUT',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
        email: user.email,
        cart: save
		  })
		}).then((res) => res.json()).then((res) => {
		  if(res.error) {
			alert(res.error);
		  } else {
        let tempUser = user;
        tempUser.cart = save;
        setUser(tempUser);
			  navigate(0);
		  }
		})
    
  };

  const changedFunction = (num, value, amount) => {
    let temp = newCart;
    temp[num].quantity = amount;
    setNewCart(temp);
    temp = itemsChanged;
    temp[num] = value;
    setItemsChanged(temp);
    setChanged(temp.some(item=>item===true) || itemsDeleted.some(item=>item===true));
  }

  const deleteRow = (id, num) => {
    for(let i = 0;i < newCart.length;++i){
      let temp = newCart
      if(temp[i].productId === id){
        temp[i].deleted = true;
        setNewCart(temp);
        temp = itemsDeleted;
        temp[num] = true;
        setItemsDeleted(temp);
        setChanged(true);
        break;
      }
    }
  }

  const retrieveRow = (id, num) => {
    for(let i = 0;i < newCart.length;++i){
      let temp = newCart
      if(temp[i].productId === id){
        temp[i].deleted = false;
        setNewCart(temp);
        temp = itemsDeleted;
        temp[num] = false;
        setItemsDeleted(temp);
        setChanged(temp.some(item=>item===true) || itemsChanged.some(item=>item===true));
        break;
      }
    }
  }

  useEffect(() => {
    if(user.cart){
      setNewCart(user.cart.map((item)=>{return {productId: item.productId, quantity: item.quantity}}));
      let temp = [];
      user.cart.forEach((e, i) => {
        temp[i] = false;
      });
      setItemsDeleted(temp);
      setItemsChanged(temp);
    }
  }, [user]);
  if(Object.keys(user).length <= 0){return}
  return <div>
    {user.cart.length > 0?
      <>
      <h1>{`You have ${user.cart.length} Items in your Cart:`}</h1>
      <table id='itemWrapper'>
        {
          user.cart.map((item, index) => <CartItem index={index} key={item.productId} retrieveFunc={(e) => {retrieveRow(item.productId, index)}} changedFunc={changedFunction} deleteFunc={(e) => {deleteRow(item.productId, index)}} cartItem={item} />)
        }
      </table>
      <button onClick={changed?saveCart:buyCart} className='button1'>{changed?'Save Changes':'Buy Cart'}</button>
      </>
      :
      <>
      <h1>You currently Don't Have Any Items in Your Cart</h1>
      <h3>Try Searching for Products You Like to Add to Your Cart</h3>
      </>
    }
  </div>
}

export default Cart;