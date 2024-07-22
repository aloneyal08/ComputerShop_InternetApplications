import React, { useState, useEffect, useContext } from 'react'
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import htmlToDraft from 'html-to-draftjs';
import draftToHtmlPuri from "draftjs-to-html";
import SelectSearch from 'react-select-search';
import { UserContext } from '../../Contexts';

const CreateMessage = ({reload}) => {
	const {user} = useContext(UserContext);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
 
	const [emails, setEmails] = useState([]);
	const [to, setTo] = useState('');
	const [subject, setSubject] = useState('');
	const [header, setHeader] = useState('');
	const [content, setContent] = useState('');
	const [content2, setContent2] = useState('');
	
	useEffect(()=>{
		if(user.level===1){
			setTo('admins');
			return;
		}
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/emails`).then((res) => res.json()).then((res) =>{
			setEmails(['all', 'users', 'suppliers', 'admins', 'post to Facebook'].concat(res));
		});
	}, [user])

	useEffect(() => {
		const blocksFromHtml = htmlToDraft("");
		const { contentBlocks, entityMap } = blocksFromHtml;
		const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
		const editorState = EditorState.createWithContent(contentState);
		setContent(editorState);
	}, []);

	const onSubjectChange = (e) => setSubject(e.target.value);
	const onHeaderChange = (e) => setHeader(e.target.value);
	const onContentChange = (state) => setContent(state);
	const onContent2Change = (e) => setContent2(e.target.value);
	const onToChange = (email) => setTo(email);

	const onSubmit = () => {
		let c = '';
		let s = subject;
		if(to === '')
			return alert('Please enter a recipient');

		if(s === '')
			return alert('Please enter a subject');

		if(header === '')
			return alert('Please enter a header');

		if(content === '' && content2 === '')
			return alert('Please enter a message');
		
		if(to==="post to Facebook")
			s = 'Facebook Post';
		else
		c = draftToHtmlPuri(convertToRaw(content.getCurrentContent()));

		fetch(`${process.env.REACT_APP_SERVER_URL}/message/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: to==="post to Facebook" ? "facebook" : to, 
				subject: s,
				header, 
				content: to==="post to Facebook" ? content2 : c, 
				from: user.level===2 ? 'admin' : user.email, 
				level: user.level
			}),
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
				setContent2('');
			}
		})
	}

	return <div>
		<button className='button1' onClick={(e)=>{setIsPopupOpen(!isPopupOpen);e.currentTarget.scrollIntoView({block: 'center', inline: 'center'})}} style={{width: "200px"}}>
			{isPopupOpen ? '- Close' : '+ Create Message'}
		</button>
		{isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
		<div className={'popup messagePopup ' + (isPopupOpen ? 'scale1' : '')}>
			<div className='arrowUp'/>
			<h2>New Message{user.level===1 ? ' (to admin)' : ''}</h2>
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
				{to!=="post to Facebook"&&<div className="input1">
				<label>
					<input type='text' required onChange={onSubjectChange} value={subject}/>
					<span>Subject</span>
				</label>
			</div>}
			<span>Content</span>
			<div className="input1">
				<label>
					<input type='text' required onChange={onHeaderChange} value={header}/>
					<span>Header</span>
				</label>
			</div>
			{to !== "post to Facebook"
				?<Editor 
				editorState={content}
				toolbarClassName="toolbarClassName"
				wrapperClassName="messageWrapperEditor"
				editorClassName="richTextInput1 scrollBar2"
				spellCheck={true}
				toolbarStyle={{backgroundColor: "transparent", border: "none"}}
				editorStyle={{overflowX: 'auto', marginLeft: "10px", fontSize: '14px', lineHeight: '15px', borderBottom: "0.125rem solid rgba(19, 19, 21, 0.6)"}}
				toolbar={{
					options: ['inline', 'fontSize', 'list', 'textAlign'],
					list: {inDropdown: true}
				}}
				onEditorStateChange={onContentChange}
				placeholder='Content'
			/>
			: <div className="input1">
				<label>
					<textarea required onChange={onContent2Change}/>
					<span>Content</span>
				</label>
			</div>
			}
			<br/>
			<button className='button1' onClick={onSubmit}>Send</button>
		</div>
	</div>
}

export default CreateMessage;