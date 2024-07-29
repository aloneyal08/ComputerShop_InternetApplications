import React, { useState, useEffect, useContext } from 'react'
import { UserContext, MoneyContext} from '../../Contexts';
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
  const [validPhoto, setValidPhoto] = useState(false);
  const [stats, setStats] = useState({});
  const [statTitle, setStatTitle] = useState('');
  const [statValue, setStatValue] = useState('');
  const [linkedProductOptions, setLinkedProductOptions] = useState([]);
  const [parent, setParent] = useState(null);
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setDescription(editorState);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/get-linked`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({supplier: user._id, product: null})
		}).then(res=>res.json()).then(res=>{
      setLinkedProductOptions([{name: 'No Linked Product', value:null}].concat(res.map(p=>{return {name: p.name, value: p._id, photo: p.photo}})))}
    );
  }, [user._id])

	const onTextChange = (state) => {
		setDescription(state);
	};

	const changeImageFunc = (e) => {
		let val = e?e.currentTarget.value:'';
		setValidPhoto(true);
		setPhoto(val);
	};

  const priceChange = (e) =>{
    let pr = e.target.value === ''? '' : Math.max(0, Math.floor(Number(e.target.value)*100)/100);
    e.target.value = pr
    setPrice(pr);
  };

  const addStat = () => {
    if(Object.keys(stats).length >= 10){
      return;
    }
    if(statTitle === '' || statValue === ''){
      alert('missing stat name/value');
      return;
    }
    if(statTitle.length > 20 || statValue.length > 20){
      alert('stat name/value can be no longer then 20 characters');
      return;
    }
    let temp = {...stats};
    temp[statTitle] = statValue;
    setStats(temp);
    setStatTitle('');
    setStatValue('');
  };

  const removeStat = (key) => {
    let temp = {...stats};
    delete temp[key];
    setStats(temp);
  };

  const addProduct = async (e) => {
    console.log(stats);
    console.log(parent);
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
    if(price === null || price === 0){
      alert('A product price must be entered!');
      return;
    }
    if(value === '<p></p>\n'){
      alert('A product description must be entered!');
      return;
    }
    if(photo === '' || !validPhoto){
      alert('A product picture must be entered!');
      return;
    }
    fetch(`${process.env.REACT_APP_SERVER_URL}/product/add`, {
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
        supplier: user._id,
        stats,
        parentProduct: parent
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
  return <div style={{paddingBottom: "500px"}}>
      <div id='newProductContainer'>
        <h1 id='title'>Add New Product</h1>
        <div id='divider'>
          <section id='inputs'>
            <h3 className='inputTitle'>Base Information</h3>
            <section className='inputContainer' id='baseInfoContainer'>
              <div className="input1 input2">
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
                  editorStyle={{minHeight: '15vh', border: '1px solid gainsboro', fontSize: '14px', lineHeight: '15px', zIndex: 0, position: "relative"}}
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
              <div className="input1 input2">
                <label>
                  <input required type='text' onChange={changeImageFunc}/>
                  <span>Product Photo*</span>
                </label>
              </div>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Details</h3>
            <section className='inputContainer' id='detailContainer'>
              <div className="input1 input2">
                <label>
                  <input required type='number' step={1} min={0} onChange={(e) => {setStock(e.target.value);}}/>
                  <span>Starting Stock*</span>
                </label>
              </div>
              <hr className='separator' />
              <div className="input1 input2 num">
                <label>
                  <input required type='number' step={0.01} min={0.01} onChange={priceChange} value={price}/>
                  <span>Product Price*</span>
                </label>
              </div>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Tags</h3>
            <section className='inputContainer' id='tagsContainer' style={{paddingRight: "50px", paddingLeft: "25px"}}>
              <TagSelect value={chosenTags} onChange={setChosenTags} noTagsText="None"/>
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Stats</h3>
            <section className='inputContainer'>
              <table>
                <tbody>
                  {
                    Object.keys(stats).map(key=><tr className='statsRow' key={key}>
                      <td className='statTitle'>{key}</td>
                      <td className='statValue'>{stats[key]}</td>
                      <td><button className='button1' onClick={() => removeStat(key)}>✕</button></td>
                    </tr>)
                    }
                    </tbody>
                  </table>
                    {Object.keys(stats).length<10?
                      <div className='statsRow' id='statInput'>
                        <div>
                          <div className="input1 input2">
                            <label>
                              <input value={statTitle} style={{fontWeight: 'bold'}} required type='text' onChange={e=>setStatTitle(e.currentTarget.value)}/>
                              <span>Stat Name</span>
                            </label>
                          </div>
                        </div>
                        <div style={{maxWidth: '10px'}}>-</div>
                        <div>
                          <div className="input1 input2">
                            <label>
                              <input value={statValue} required type='text' onChange={e=>setStatValue(e.currentTarget.value)}/>
                              <span>Stat Value</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <button className='button1' onClick={addStat}>+</button>
                        </div>
                      </div>
                      :
                      null
                    }
                      {Object.keys(stats).length>=10?
                      <p style={{color: 'red', fontWeight: 'bold'}} id='statsError'>No more than 10 stats</p>
                      :
                      null
                      }
            </section>
            <hr className='separator' />
            <h3 className='inputTitle'>Linked Product</h3>
            <section className='inputContainer'>
              <p style={{color: 'gray', textAlign:'left', fontSize: '14px'}}>You can't choose a product that already has a link to another product*</p>
              <SelectSearch value={parent} onChange={(e)=>{setParent(e)}} search={true} name="link" id='linkedProductInput' options={linkedProductOptions} placeholder="Link Your Product" renderValue={(valueProps) =>
                <div className='input1 input2'>
                  <label>
                  <input type='text' required {...valueProps} placeholder=''/>
                  <span>{valueProps.placeholder}</span>
                  </label>
                </div>} renderOption={(optionsProps, optionsData) => {
                    return <button className='select-search-option' {...optionsProps}>{optionsData.photo?<img alt='     ' src={optionsData.photo}  className='productLinkImg'/>:null}{optionsData.name}</button>
                }}
                filterOptions={[(arr, b) => {
                  return arr.filter((e)=>e.name.toLocaleLowerCase().includes(b.toLocaleLowerCase()))
                }]}/>
            </section>
          </section>
          <section id='preview'>
            <ProductCard isClickable={false} onImageError={()=>{setValidPhoto(false)}} product={{name: name===''?"Product's Name":name, price: price===''?"Product's Price":price/exchangeRates[currency], stock, photo, rating: 2.5, supplierName: user.fullName, discount: 0}} />
            <button id='addProductBtn' onClick={addProduct} className='button1'>Add New Product</button>
          </section>
        </div>
      </div>
  </div>

}

export default NewProduct;
