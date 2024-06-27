import React, { useRef, useState, useEffect, useContext } from 'react'
import { UserContext, MoneyContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import SelectSearch from 'react-select-search';
import { Rating } from 'react-simple-star-rating'
import 'react-select-search/style.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import './newProduct.css';

const currencies = require('../../currencies.json');

const NewProduct = () => {
  const {user} = useContext(UserContext);
  const {currency, exchangeRates} = useContext(MoneyContext);
  const tagSelect = useRef(null);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [hiddenTags, setHiddenTags] = useState([]);
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setDescription(editorState);
    fetch('http://localhost:88/tag/get').then((res) => res.json()).then((res) =>{
      setTagOptions(res.map((e, index) => {return {name: e.text, value: index, disabled: false}}));
    });
  }, []);
  
  useEffect(() =>{
  }, [currency])

  const onTextChange = (state) => {
    setDescription(state);
  };

  const changeImageFunc = (e) => {
    let val = e?e.currentTarget.value:'';
    setPhoto(val);
  };

  const priceChange = (e) =>{
    e.target.value = e.target.value === ''? '' : Math.floor(e.target.value*100)/100;
    setPrice(e.target.value);
  }
  const removeTag = (e) =>{
    let temp = tagOptions;
    let i = e.currentTarget.id;
    temp[i].disabled = false;
    setTagOptions(temp);
    temp = tags.slice();
    temp.splice(temp.indexOf({name: tagOptions[i].name, value: i}), 1);
    setTags(temp);
    temp = hiddenTags;
    temp.push(tagSelect.current.children[1].children[0].children[i]);
    temp[temp.length-1].style.display = 'block';
    setHiddenTags(temp);
  };

  const addTag = (i) => {
    let temp = tagOptions;
    i = i==null?0:i;
    temp[i].disabled = true;
    setTagOptions(temp);
    temp = tags.slice();
    temp.push({name: tagOptions[i].name, value: i});
    setTags(temp);
    temp = hiddenTags;
    temp.push(tagSelect.current.children[1].children[0].children[i]);
    temp[temp.length-1].style.display = 'none';
    setHiddenTags(temp);
  };

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
        tags: tags.length===0?null:tags.map((tag) => {return {text: tag.text};}),
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
                  <input required type='number' step={1} min={1} onChange={(e) => {setStock(e.target.value);}}/>
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
              {
                <div className='productTags'>
                  {tags.map(tag=>(<div className='productTag'><p className='productTagName'>{tag.name}</p><span id={tag.value} onClick={removeTag}>x</span></div>))}
                </div>
              }
              <SelectSearch ref={tagSelect} onChange={addTag} search={true} getOptions={()=>tagOptions.filter((tag)=>tag.disabled === false)} name="tag" placeholder="Choose Your Tags" renderValue={(valueProps) =>
                <div className='input1'>
                  <label>
                  <input type='text' {...valueProps} placeholder=''/>
                  <span>{valueProps.placeholder}</span>
                  </label>
                </div>} renderOption={(optionsProps, optionsData) => {
                    return <button className='select-search-option' {...optionsProps}>{optionsData.name}</button>
                }} />
            </section>
          </section>
          <section id='preview'>
            <div className='productCard'>
              <img className='productImg' alt=' ' src={photo} onError={(e) =>{e.currentTarget.src = require('../../images/defaultProduct.jpg')}}/>
              <div className='productText'>
                <section className='productTextLeft'>
                  <h3 className='productName'>{name===''?"Product's Name":name}</h3>
                  <aside><h6 className='productSupplier' >{user.fullName}</h6></aside>
                  <h4 className='productStock'>{stock>=1?"":'Currently None in Stock*' }</h4>
                  <Rating 
                    readonly={true}
                    initialValue={2.5}
                    allowFraction={true}
                    size={35}
                    id='productRating'
                  />
                </section>
                <section className='productTextRight'>
                  <h4 className='productPrice'>{price===''?"Product's Price":currencies[currency].symbol + price}</h4>
                </section>
              </div>
            </div>
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
