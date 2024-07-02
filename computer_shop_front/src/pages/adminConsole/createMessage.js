import React, { useState, useEffect } from 'react'
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import SelectSearch from 'react-select-search';

const CreateMessage = ({reload}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
 
  const [emails, setEmails] = useState([]);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [header, setHeader] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    const blocksFromHtml = htmlToDraft("");
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    setContent(editorState);
    fetch('http://localhost:88/user/emails').then((res) => res.json()).then((res) =>{
      setEmails(['all', 'users', 'suppliers', 'admins'].concat(res));
    });
  }, []);

  const onSubjectChange = (e) => setSubject(e.target.value);
  const onHeaderChange = (e) => setHeader(e.target.value);
  const onContentChange = (state) => setContent(state);
  const onToChange = (email) => setTo(email);

  const onSubmit = () => {
    let c = draftToHtmlPuri(convertToRaw(content.getCurrentContent()));
    if(to === '')
      return alert('Please enter a recipient');

    if(subject === '')
      return alert('Please enter a subject');

    if(header === '')
      return alert('Please enter a header');

    if(content === '')
      return alert('Please enter a message');

    fetch(`http://localhost:88/message/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({to, subject, header, content: c}),
    }).then(res=>res.json()).then(res=>{
      if(res.error) {
        alert(res.error);
      } else {
        reload();
        setIsPopupOpen(false);
        setTo('');
        setSubject('');
        setHeader('');
        setContent('');
      }
    })
  }

  return <div>
    <button className='button1' onClick={()=>setIsPopupOpen(!isPopupOpen)} style={{width: "200px"}}>
      {isPopupOpen ? '- Close' : '+ Create Message'}
    </button>
    {isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
    <div className={'popup messagePopup ' + (isPopupOpen ? 'scale1' : '')}>
      <div className='arrowUp'/>
      <h2>New Message</h2>
      <span>Email</span>
        {emails.length>0&&<SelectSearch onChange={onToChange} search={true} value={to} getOptions={()=>emails.map(email=>({value: email, name: email}))} placeholder="To" renderValue={(valueProps) =>
        <div className='input1'>
          <label>
          <input type='text' required {...valueProps} placeholder=''/>
          <span>{valueProps.placeholder}</span>
          </label>
        </div>} renderOption={(optionsProps, optionsData) => {
            return <button className='select-search-option' {...optionsProps}>{optionsData.value}</button>
        }} />}
      <div className="input1">
        <label>
          <input type='text' required onChange={onSubjectChange}/>
          <span>Subject</span>
        </label>
      </div>
      <span>Content</span>
      <div className="input1">
        <label>
          <input type='text' required onChange={onHeaderChange}/>
          <span>Header</span>
        </label>
      </div>
      
      <Editor 
        editorState={content}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="richTextInput1"
        spellCheck={true}
        toolbarStyle={{backgroundColor: "transparent", border: "none"}}
        editorStyle={{minHeight: '15vh', marginLeft: "10px", fontSize: '14px', lineHeight: '6px', borderBottom: "0.125rem solid rgba(19, 19, 21, 0.6)"}}
        toolbar={{
          options: ['inline', 'fontSize', 'list', 'textAlign'],
          list: {inDropdown: true}
        }}
        onEditorStateChange={onContentChange}
        placeholder='Content'
      />
      <br/>
      <button className='button1' onClick={onSubmit}>Send</button>
    </div>
  </div>
}

export default CreateMessage;