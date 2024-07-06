import React, { useRef, useState, useEffect, useContext } from 'react'
import { UserContext, MoneyContext, TagsContext} from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import './newProduct.css';
import { ProductCard } from '../../components/productCard/productCard';

const NewProduct = () => {
  const {user} = useContext(UserContext);
  const {currency, exchangeRates} = useContext(MoneyContext);
  const tags = useContext(TagsContext);
  const tagSelect = useRef(null);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [photo, setPhoto] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [chosenTags, setChosenTags] = useState([]);
  const [validPhoto, setValidPhoto] = useState(false);
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setDescription(editorState);
  }, []);
  
  useEffect(()=>{
    setTagOptions(tags.map((e, index) => {return {name: e.text, value: index, disabled: false}}));
  }, [tags]);

  useEffect(()=>{
    console.log(validPhoto)
  }, [validPhoto])

  const onTextChange = (state) => {
    setDescription(state);
  };

  const changeImageFunc = (e) => {
    let val = e?e.currentTarget.value:'';
    setValidPhoto(true);
    setPhoto(val);
  };

  const priceChange = (e) =>{
    let pr = e.target.value === ''? '' : Math.floor(e.target.value*100)/100
    e.target.value = pr;
    setPrice(pr/exchangeRates[currency]);
  }
  const removeTag = (e) =>{
    let temp = tagOptions;
    let i = e.currentTarget.id;
    temp[i].disabled = false;
    setTagOptions(temp);
    temp = chosenTags.slice();
    temp.splice(temp.indexOf({name: tagOptions[i].name, value: i}), 1);
    setChosenTags(temp);
  };

  const addTag = (i) => {
    let temp = tagOptions;
    i = i===null?0:i;
    temp[i].disabled = true;
    setTagOptions(temp);
    temp = chosenTags.slice();
    temp.push({name: tagOptions[i].name, value: i});
    setChosenTags(temp);
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
      return;
    }
    if(photo === '' || !validPhoto){
      alert('A product picture must be entered!');
      return;
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
        tags: chosenTags.length===0?null:chosenTags.map(tag => tags.find(t => t.text === tag.name)._id).filter(tag => tag),
        supplier: user._id
      })
    }).then((res) => res.json()).then((res) => {
      if(res.error) {
        alert(res.error);
      } else {
        navigate('/');
      }
    })
  };
  if(Object.keys(user).length === 0){
    return;
  }
  if(tagOptions.length === 0){
    return;
  }
  return <div style={{paddingBottom: "500px"}}>
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
                  editorStyle={{minHeight: '15vh', border: '1px solid gainsboro', fontSize: '14px', lineHeight: '15px'}}
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
              {
                <div className='productTags'>
                  {chosenTags.map(tag=>(<div className='productTag'><p className='productTagName'>{tag.name}</p><span id={tag.value} onClick={removeTag}>x</span></div>))}
                </div>
              }
              <SelectSearch ref={tagSelect} onChange={addTag} search={true} getOptions={()=>tagOptions.filter((tag)=>tag.disabled === false)} name="tag" placeholder="Choose Your Tags" renderValue={(valueProps) =>
                <div className='input1'>
                  <label>
                  <input onSelect={()=>{tagSelect.current.scrollIntoView();}} type='text' required {...valueProps} placeholder=''/>
                  <span>{valueProps.placeholder}</span>
                  </label>
                </div>} renderOption={(optionsProps, optionsData) => {
                    return tags.find(t=>t.name===optionsData.name) ? null : <button className='select-search-option' {...optionsProps}>{optionsData.name}</button>
                }} />
            </section>
          </section>
          <section id='preview'>
            <ProductCard isClickable={false} onImageError={()=>{setValidPhoto(false)}} product={{name: name===''?"Product's Name":name, price: price===''?"Product's Price":price, stock, photo, rating: 2.5, supplierName: user.fullName}} />
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
