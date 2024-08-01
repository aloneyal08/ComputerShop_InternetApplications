import React, {useState, useContext} from 'react'
import { formatPhoneNumber, sleep, validateUsername } from '../../utils';
import { MoneyContext, UserContext } from '../../Contexts'

const currencies = require('../../currencies.json');

const getStatusObj = (s) => {
	switch (s) {
		case 0:
			return {message: "... Pending", color: "#4a4a4a"}
		case 1:
			return {message: "✓ Accepted", color: "green"}
		case 2:
			return {message: "X Rejected", color: "red"}
		case 3:
			return {message: "X Cancelled", color: "grey"}
		default:
			return {message: "X Error", color: "red"}
	}
}


export const RequestListItem = ({request, reload, selectedReq, setSelectedReq}) => {
	const {user} = useContext(UserContext)

	const acceptRequest = () => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/supplier/request/accept`, {
			method: 'POST',
			body: JSON.stringify({id: request._id, username: user.username, password: user.password}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(()=>{
			setSelectedReq(null);
			reload();
		})
	}

	const rejectRequest = () => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/supplier/request/reject`, {
			method: 'POST',
			body: JSON.stringify({id: request._id, username: user.username, password: user.password}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(()=>{
			setSelectedReq(null);
			reload();
		})
	}


	const status = getStatusObj(request.status);
	return <tr className='dashboardListItem' style={{cursor: request.status===0 ? "pointer" : null}} 
							onClick={request.status===0 ? async (e)=>{
								setSelectedReq(request._id)
								let row = e.currentTarget;
								let pos = row.parentElement.firstChild.clientHeight + 2;
								for(let i = 0; i < e.currentTarget.parentElement.children.length; ++i){
									if(e.currentTarget.parentElement.children[i] === e.currentTarget){
										pos += (i-2)*(e.currentTarget.clientHeight);
										break;
									}
								}
								await sleep(50);
								row.parentElement.parentElement.parentElement.scrollTo(0, pos)}: null}>
		<td className='requestName'>
			{request.user.fullName}
		</td>
		<td className='requestPhone'>
			{formatPhoneNumber(request.user.phone)}
		</td>
		<td className='requestDate'>
			{new Date(request.date).toLocaleDateString()}
		</td>
		<td style={{color: status.color}} className='statusText'>
			{status.message}
		</td>
		<td className={'popup requestPopup ' + (selectedReq===request._id ? 'scale1' : '')}>
			<div className='arrowUp centerAbsolute'/>
			<h5 style={{margin: "5px"}}>Email: {request.user.email}</h5>
			<h5 style={{margin: "5px"}}>Request Description:</h5>
			<p className='requestDescription'>{request.description}</p>
			<div className='requestButtons'>
				<button className='button1 acceptButton' onClick={acceptRequest}>Accept</button>
				<button className='button1 rejectButton' onClick={rejectRequest}>Reject</button>
			</div>
		</td>
	</tr>
};

export const SupplierListItem = ({supplier, reload}) => {

	const changeUserStatus = () =>{
		window.confirm(`Are you sure you want to preform this action?`, '', ()=>{
			fetch(`${process.env.REACT_APP_SERVER_URL}/user/${supplier.suspended ? "restore" : "suspend"}`,{
				method: 'PUT',
				body: JSON.stringify({email: supplier.email}),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res=>res.json()).then(rs=>{
				if(rs.error)
					alert(rs.error);
				else
					reload();
			})
		})
	}

	return <tr className='dashboardListItem'>
		<td>
			{supplier.fullName}
		</td>
		<td>
			{formatPhoneNumber(supplier.phone)}
		</td>
		<td>
			{supplier.email}
		</td>
		<td>
		<button className={'button1 rejectButton ' + (supplier.suspended ? '' : 'darkRedGradient')} onClick={changeUserStatus} style={{fontSize: "15px", width: "200px"}}>
			{supplier.suspended ? "Restore" : "Suspend"} Account
		</button>
		</td>
	</tr>
}

export const MessageListItem = ({message, isTo=true, selectedMessage, setSelectedMessage}) => {
	const {user} = useContext(UserContext);


	return <tr className='dashboardListItem' onClick={async (e)=>{
		setSelectedMessage(message._id);
		let row = e.currentTarget;
		let pos = row.parentElement.firstChild.clientHeight + 2;
		for(let i = 0; i < e.currentTarget.parentElement.children.length; ++i){
			if(e.currentTarget.parentElement.children[i] === e.currentTarget){
				pos += (i-2)*(e.currentTarget.clientHeight);
				break;
			}
		}
		await sleep(50);
		row.parentElement.parentElement.parentElement.scrollTo(0, pos)}}>
		<td style={{width: "300px"}}>
			{message.from===user.email ? "You" : message.from}
		</td>
		{isTo&&<td style={{width: "300px"}}>
			{message.to}
		</td>}
		<td>
			{message.subject}
		</td>
		<td>
			{new Date(message.date).toLocaleDateString()}
		</td>
		<td className={'popup requestPopup ' + (selectedMessage===message._id ? 'scale1' : '')}>
			<div className='arrowUp centerAbsolute'/>
			<h2 style={{margin: "5px"}}>{message.header}</h2>
			<div dangerouslySetInnerHTML={{ __html: message.content}}/>
		</td>
	</tr>
}

export const AdminListItem = ({admin, reload}) => {
	const {user} = useContext(UserContext);
	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const [username, setUsername] = useState(admin.username);
	const [password, setPassword] = useState(admin.password);
	const [usernameValid, setUsernameValid] = useState(true);

	const deleteAdmin = () => {
		window.confirm(`Are you sure you want to delete ${admin.fullName}?`, '', ()=>{
			fetch(`${process.env.REACT_APP_SERVER_URL}/user/delete`, {
				method: 'DELETE',
				body: JSON.stringify({email: admin.email}),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res=>res.json()).then(rs=>{
				if(rs.error) {
					alert(rs.error);
				} else {
					reload();
				}
			})
		})
	}

	const onUsernameChange = (e) => {
		setUsername(e.target.value);
		if(validateUsername(e.target.value)) {
			setUsernameValid(true);
		}
	}
	const onPasswordChange = (e) => setPassword(e.target.value);
	const checkUsernameValid = () => setUsernameValid(validateUsername(username))

	const onSubmit = () => {
		checkUsernameValid();
		if(!usernameValid) {
			alert('Invalid username');
			return;
		}

		fetch(`${process.env.REACT_APP_SERVER_URL}/user/update/username`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: admin.email,
				username
			})
		}).then((res) => res.json()).then((res) => {
			if(res.error) {
				alert(res.error);
			} else {
				fetch(`${process.env.REACT_APP_SERVER_URL}/user/update/password`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						email: admin.email,
						password,
						oldPassword: admin.password,
						oldPassEnc: true
					})
				}).then((res) => res.json()).then((res) => {
					if(res.error) {
						alert(res.error);
					} else {
						setIsPopupOpen(false);
						reload();
					}
				})
			}
		})
	}

	return <tr className='dashboardListItem'>
		<td >
			{admin.fullName}
		</td>
		<td>
			{admin.email}
		</td>
		<td>
			{formatPhoneNumber(admin.phone||'0000000000')}
		</td>
		<td>
			{user.email !== admin.email && <button className='iconButton deleteButton' onClick={deleteAdmin}/>}
			{user.email !== admin.email && <button className='iconButton editButton' onClick={async (e)=>{
				setIsPopupOpen(true);
				let row = e.currentTarget.parentElement.parentElement;
				let pos = row.parentElement.firstChild.clientHeight + 2;
				for(let i = 0; i < e.currentTarget.parentElement.parentElement.parentElement.children.length; ++i){
					if(e.currentTarget.parentElement.parentElement.parentElement.children[i] === e.currentTarget.parentElement.parentElement){
						pos += (i-2)*(e.currentTarget.parentElement.parentElement.clientHeight);
						break;
					}
				}
				await sleep(50);
				row.parentElement.parentElement.parentElement.scrollTo(0, pos)}}/>}
		</td>
		{isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
		<td className={'popup requestPopup adminEditPopup ' + (isPopupOpen ? 'scale1' : '')}>
			<div className='arrowUp'/>
			<div className="input1">
				<label>
					<input type='text' required onChange={onUsernameChange} value={username} onBlur={checkUsernameValid} className={usernameValid ? '' : 'invalidBox'}/>
					<span className={usernameValid ? '' : 'invalidText'}>{usernameValid ? 'Username' : 'INVALID USERNAME'}</span>
				</label>
			</div>
			<div className="input1">
				<label>
					<input type='password' value={password} required onChange={onPasswordChange}/>
					<span>Password</span>
				</label>
			</div>
			<button className='button1' onClick={onSubmit}>Submit</button>
		</td>
	</tr>
}

export const TagListItem = ({tag, reload}) => {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [text, setText] = useState(tag.text);

	const onTextChange = (e) => setText(e.target.value);

	const deleteTag = () => {
		window.confirm(`Are you sure you want to delete ${tag.text}?`, '', ()=>{
			fetch(`${process.env.REACT_APP_SERVER_URL}/tag/delete`, {
				method: 'DELETE',
				body: JSON.stringify({_id: tag._id}),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res=>res.json()).then(rs=>{
				if(rs.error) {
					alert(rs.error);
				} else {
					reload();
				}
			})
		})
	}

	const onSubmit = () => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/tag/edit`, {
			method: 'PUT',
			body: JSON.stringify({_id: tag._id, text}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res=>res.json()).then(rs=>{
			if(rs.error) {
				alert(rs.error);
			} else {
				reload();
				setIsPopupOpen(false);
			}
		})
	}

	return <tr className='dashboardListItem'>
		<td >
			{tag.text}
		</td>
		<td>
			<button className='iconButton deleteButton' onClick={deleteTag}/>
			<button className='iconButton editButton' onClick={async (e)=>{
				setIsPopupOpen(true);
				let row = e.currentTarget.parentElement.parentElement;
				let pos = row.parentElement.firstChild.clientHeight + 2;
				for(let i = 0; i < e.currentTarget.parentElement.parentElement.parentElement.children.length; ++i){
					if(e.currentTarget.parentElement.parentElement.parentElement.children[i] === e.currentTarget.parentElement.parentElement){
						pos += (i-2)*(e.currentTarget.parentElement.parentElement.clientHeight);
						break;
					}
				}
				await sleep(50);
				row.parentElement.parentElement.parentElement.scrollTo(0, pos)
				}}/>
		</td>
		{isPopupOpen&&<div className='allScreen' onClick={()=>setIsPopupOpen(false)}/>}
		<td className={'popup requestPopup tagEditPopup ' + (isPopupOpen ? 'scale1' : '')}>
			<div className='arrowUp'/>
			<div className="input1">
				<label>
					<input type='text' value={text} required onChange={onTextChange}/>
					<span>Text</span>
				</label>
			</div>
			<button className='button1' onClick={onSubmit}>Submit</button>
		</td>
	</tr>
}

export const HistoryListItem = ({item}) => {
	const {exchangeRates, currency} = useContext(MoneyContext);

	return <tr className='dashboardListItem'>
		<td>
			<img src={item.photo} alt=' ' style={{height: "50px"}}/>
		</td>
		<td style={{width: "300px"}}>
			{item.name||"Not Available"}
		</td>
		<td>
			{item.fullName||"Not Available"}
		</td>
		<td>
			{item.quantity}
		</td>
		<td>
			{Math.floor(item.price*exchangeRates[currency]*100)/100}{currencies[currency].symbol}
		</td>
		<td>
			{new Date(item.date).toLocaleDateString()}
		</td>
	</tr>
}