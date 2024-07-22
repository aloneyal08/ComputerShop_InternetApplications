import React, { useState, useEffect } from 'react'
import './Alert.css'

const Alert = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [header, setHeader] = useState('');
	const [message, setMessage] = useState('');
	const [callback, setCallback] = useState(null);

	useEffect(() => {
		if(!isVisible)
			setCallback(null);
	}, [isVisible])
	

	const show = (header, message='') => {
		setIsVisible(true);
		setHeader(header);
		setMessage(message);
	}

	const confirm = (header, message='', callback) => {
		setIsVisible(true);
		setHeader(header);
		setMessage(message);
		setCallback(()=>callback);
	}

	return [
		()=> (isVisible ? <div className='alertOut'>
			<div className='alertIn'>
				<div>
					<h1>{header}</h1>
					<p>{message}</p>
				</div>
				<div className='alertButtons'>
					<button className='button1 alertButton' onClick={()=>setIsVisible(false)}>Close</button>
					{callback&&<button className='button1 alertButton' onClick={()=>{setIsVisible(false);callback()}}>OK</button>}
				</div>
			</div>
		</div> : null)
	, show, confirm]
}

export default Alert;