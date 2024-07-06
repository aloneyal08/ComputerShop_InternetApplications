import React, { useState, useEffect, useContext } from 'react'
import { UserContext, MoneyContext} from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import 'react-select-search/style.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import './newProduct.css';
import { ProductCard } from '../../components/productCard/productCard';
import TagSelect from '../../components/tagSelect/tagSelect';

const NewProduct = () => {
  const {user} = useContext(UserContext);
  const {currency, exchangeRates} = useContext(MoneyContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');
  const [chosenTags, setChosenTags] = useState([]);
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setDescription(editorState);
  }, []);

  const onTextChange = (state) => {
    setDescription(state);
  };

  const changeImageFunc = (e) => {
    let val = e?e.currentTarget.value:'';
    setPhoto(val);
  };

  const priceChange = (e) =>{
    let pr = e.target.value === ''? '' : Math.floor(e.target.value*100)/100
    e.target.value = pr;
    setPrice(pr);
  }

  const addProduct = async (e) => {
    let value = draftToHtmlPuri(
      convertToRaw(description.getCurrentContent())
    );
    if(name === ''){
      alert('A product name must be entered!');
      return;
    }
    if(stock === null){
      alert('A starting stock must be entered!');
      return;
    }
    if(price === null){
      alert('A product price must be entered!');
      return;
    }
    if(value === ''){
      alert('A product description must be entered!');
    }
    if(photo === ''){
      alert('A product picture must be entered!');
    }
    fetch('http://localhost:88/product/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: value,
        stock,
        price: price/exchangeRates[currency],
        photo: photo === ''?null:photo,
        tags: chosenTags.length===0?null:chosenTags.map(t=>t.value),
        supplier: user._id
      })
    }).then((res) => res.json()).then((res) => {
      if(res.error) {
        alert(res.error);
      } else {
        alert('Successfully added product!');
        navigate('/');
      }
    })
  };
  if(Object.keys(user).length === 0){
    return;
  }
  return <div>
    {user.level === 1?
      <div id='newProductContainer'>
        <h1 id='title'>Add New Product</h1>
        <div id='divider'>
          <section id='inputs'>
            <h3 className='inputTitle'>Base Information</h3>
            <section className='inputContainer' id='baseInfoContainer'>
              <div className="input1">
                <label>
                <input type='text' required onChange={(e) => {setName(e.target.value);}}/>
                <span>Product Name*</span>
                </label>
                <hr className='separator' />
                <Editor 
                  editorState={description}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  spellCheck={true}
                  editorStyle={{minHeight: '15vh', border: '1px solid gainsboro', fontSize: '14px', lineHeight: '6px'}}
                  toolbar={{
                    options: ['inline', 'fontSize', 'list', 'textAlign'],
                    list: {inDropdown: true}
                  }}
                  onEditorStateChange={onTextChange}
                  placeholder='Product Description*'
                />
              </div>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Picture</h3>
            <section className='inputContainer' id='pictureContainer'>
              <div className="input1">
                <label>
                  <input required type='text' onChange={changeImageFunc}/>
                  <span>Product Photo*</span>
                </label>
              </div>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Details</h3>
            <section className='inputContainer' id='detailContainer'>
              <div className="input1">
                <label>
                  <input required type='number' step={1} min={0} onChange={(e) => {setStock(e.target.value);}}/>
                  <span>Starting Stock*</span>
                </label>
              </div>
              <hr className='separator' />
              <div className="input1 num">
                <label>
                  <input required type='number' step={0.01} min={0.01} onChange={priceChange}/>
                  <span>Product Price*</span>
                </label>
              </div>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Tags</h3>
            <section className='inputContainer' id='tagsContainer'>
              <TagSelect value={chosenTags} onChange={setChosenTags}/>
            </section>
          </section>
          <section id='preview'>
            <ProductCard product={{name: name===''?"Product's Name":name, price: price===''?"Product's Price":price, stock, photo, rating: 2.5, supplierName: user.fullName}} />
            <button id='addProductBtn' onClick={addProduct} className='button1'>Add New Product</button>
          </section>
        </div>
      </div>
      :
      <div style={{display:'flex',flexDirection:'column'}}>
        <h1>{'You are not permitted to be here >:('}</h1>
        <img src='https://thumbs.dreamstime.com/z/very-angry-boy-12560031.jpg' alt=' '/>
        <button className='button1' onClick={() => {navigate('/')}}>Return back to home page</button>
      </div>
    }
  </div>

}

export default NewProduct;
