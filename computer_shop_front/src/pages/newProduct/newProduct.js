import React, { useRef, useState, useEffect, useContext } from 'react'
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import './newProduct.css';

const NewProduct = () => {
  const {user} = useContext(UserContext);
  const stockIn = useRef(null);
  const priceIn = useRef(null);
  const productImg = useRef(null);
  const productImgTxt = useRef(null);
  const navigate = useNavigate();
  const imageTypes = ['jpeg', 'png', 'jpg', 'gif'];
  let tagOptions = [];
  console.log(tagOptions)
  fetch('http://localhost:88/tag/get').then((res) => res.json()).then((res) =>{
    res.forEach((tag, index) =>{
      if(tag.text){
        let obj = {name: tag.text, value: index};
        tagOptions.push(obj);
      }
    });
  });


  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState(null);
  const [photo, setPhoto] = useState('');
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setDescription(editorState);
  }, []);
  

  const onTextChange = (state) => {
    var val = draftToHtmlPuri(
      convertToRaw(state.getCurrentContent())
    );
    setDescription(state);

  };

  const changeImageFunc = async (e) => {
    let val = e?e.currentTarget.value:'';
    if(!imageTypes.includes(val.substring(val.lastIndexOf('.') + 1))){
      val = '';
    }
    if(val == ''){
      productImg.current.style.display = 'none';
      productImgTxt.current.style.display = 'flex';
    }else {
      productImg.current.style.display = 'flex';
      productImgTxt.current.style.display = 'none';
    }
      productImg.current.src = val;
      setPhoto(val);
  };
  const addTags = (e) => {

  };
  const addProduct = async (e) => {
    if(name == ''){
      alert('A product name must be entered!');
      return;
    }
    if(stock == null){
      alert('A starting stock must be entered!');
      return;
    }
    if(price == null){
      alert('A product price must be entered!');
      return;
    }
    fetch('http://localhost:88/product/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: JSON.stringify(description),
        stock,
        price,
        photo: photo == ''?null:photo,
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
    {user.level==1?
      <div id='newProductContainer'>
        <h1 id='title'>Add New Product</h1>
        <div id='divider'>
          <div id='inputs'>
            <h3 className='inputTitle'>Base Information</h3>
            <div className='inputContainer' id='baseInfoContainer'>
              <div className="input1">
                <label>
                <input type='text' required onChange={(e) => {setName(e.target.value)}}/>
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
                  placeholder='Product Description'
                />
              </div>
            </div>
            <hr className='separator' />
            <h3 className='inputTitle'>Picture</h3>
            <div className='inputContainer' id='pictureContainer'>
              <div className="input1">
                <label>
                  <input required type='text' onChange={changeImageFunc}/>
                  <span>Product Photo</span>
                </label>
              </div>
            </div>
            <hr className='separator' />
            <h3 className='inputTitle'>Details</h3>
            <div className='inputContainer' id='detailContainer'>
              <div className="input1">
                <label>
                  <input required type='number' ref={stockIn} step={1} min={1} onChange={(e) => {setStock(e.target.value)}}/>
                  <span>Starting Stock*</span>
                </label>
              </div>
              <hr className='separator' />
              <div className="input1 num">
                <label>
                  <input required type='number' ref={priceIn} step={0.01} min={0.01} onChange={(e) => {e.target.value = Math.floor(e.target.value*100)/100;setPrice(e.target.value)}}/>
                  <span>Product Price*</span>
                </label>
              </div>
            </div>
            <hr className='separator' />
            <h3 className='inputTitle'>Tags</h3>
            <div className='inputContainer' id='tagsContainer'>
              <div></div>
              <SelectSearch search={true} options={tagOptions} value={0} name="language" placeholder="Choose your language" renderValue={(valueProps) =>
                <div className='input1'>
                  <label>
                  <input type='text' {...valueProps} placeholder=''/>
                  <span>{valueProps.placeholder}</span>
                  </label>
                </div>} />
            </div>
          </div>
          <div id='preview'>

          </div>
        </div>
      </div>
      :
      <div style={{display:'flex',flexDirection:'column'}}>
        <h1>{'You are not permitted to be here >:('}</h1>
        <img src='https://thumbs.dreamstime.com/z/very-angry-boy-12560031.jpg' />
        <button className='button1' onClick={() => {navigate('/')}}>Return back to home page</button>
      </div>
    }
  </div>

}

export default NewProduct;
{/*
        <div id='inputContainer'>
          <div id='photoInContainer'>
            <div id='imageDiv'>
              <img src='' id='productImg' ref={productImg}></img>
              <h4 id='imageText' ref={productImgTxt}>Couldn't find a product image to load</h4>
            </div>
            <div className="input1">
              <label>
                <input  required type='text' onChange={changeImageFunc}/>
                <span>Product Photo</span>
              </label>
            </div>
          </div>
          <div id='textInContainer'>
            <div className="input1">
              <label>
              <input type='text' required onChange={(e) => {setName(e.target.value)}}/>
              <span>Product Name*</span>
              </label>
            </div>
            <label id='descLa' htmlFor='descIn'>Product Description</label>
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
              placeholder='Product Description'
            />
            <div id='numbersContainer'>
              <div id='stockContainer' className='numContainer'>
                <div className='numFuncContainer' id='stockFuncContainer'>
                  <button className='button1 num' id='stockMinus' onClick={() => {stockIn.current.value = stockIn.current.value > 1?stockIn.current.value - 1:1;setStock(stockIn.current.value)}}>-</button>
                  <div className="input1 num">
                    <label className='num'>
                      <input className='num' id='stockIn' required type='number' ref={stockIn} step={1} min={1} onChange={(e) => {setStock(e.target.value)}}/>
                      <span>Starting Stock*</span>
                    </label>
                  </div>
                  <button className='button1 num' id='stockPlus' onClick={() => {stockIn.current.value = stockIn.current.value?Number(stockIn.current.value) + 1:1;setStock(stockIn.current.value)}}>+</button>
                </div>
              </div>
              <div id='priceContainer' className='numContainer'>
                <div className='numFuncContainer' id='priceFuncContainer'>
                  <button className='button1 num' id='priceMinus' onClick={() => {priceIn.current.value = priceIn.current.value?(priceIn.current.value > 10? Math.floor((priceIn.current.value - 10)*100)/100:0.01):100;setPrice(priceIn.current.value)}}>-</button>
                  
                  <button className='button1 num' id='pricePlus' onClick={() => {priceIn.current.value = priceIn.current.value?Math.round((Number(priceIn.current.value) + 10)*100)/100:100;setPrice(priceIn.current.value)}}>+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button id='addProductBtn' onClick={addProduct} className='button1'>Add New Product</button>
      </div> */}