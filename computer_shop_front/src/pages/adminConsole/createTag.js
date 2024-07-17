import React, { useState } from 'react'

const CreateTag = ({reload}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [text, setText] = useState('');
  const [background, setBackground] = useState('');


  const onTextChange = (e) => setText(e.target.value);
  const onBackgroundChange = (e) => setBackground(e.target.value);

  const onSubmit = () => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/tag/add`, {
      method: 'POST',
      body: JSON.stringify({text, background}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res=>res.json()).then(rs=>{
      if(rs.error) {
        alert(rs.error);
      } else {
        reload();
        setIsPopupOpen(false);
        setBackground('');
        setText('');
      }
    })
  }

  return <div>
    <button className='button1' onClick={()=>setIsPopupOpen(!isPopupOpen)} style={{width: "200px"}}>
      {isPopupOpen ? '- Close' : '+ Create Tag'}
    </button>
    {isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
    <div className={'popup messagePopup ' + (isPopupOpen ? 'scale1' : '')}>
    <div className='arrowUp'/>
      <div className="input1">
        <label>
          <input type='text' value={text} required onChange={onTextChange}/>
          <span>Text</span>
        </label>
      </div>
      <div className="input1">
        <label>
          <input type='text' value={background} required onChange={onBackgroundChange}/>
          <span>Background Photo</span>
        </label>
      </div>
      <button className='button1' onClick={onSubmit}>Submit</button>
    </div>
  </div>
}

export default CreateTag;