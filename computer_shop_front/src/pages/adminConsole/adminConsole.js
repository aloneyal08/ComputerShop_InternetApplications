import React, {useState, useEffect, useContext} from 'react'
import './adminConsole.css'
import {AdminListItem, MessageListItem, RequestListItem, SupplierListItem, TagListItem} from './listItem';
import CreateMessage from './createMessage';
import CreateAdmin from './createAdmin';
import CreateTag from './createTag';
import PieChart from '../../components/graphs/pieChart';
import { getTimeData } from '../supplierDashboard/supplierDashboard';
import BarGraph from '../../components/graphs/barGraph';
import { nFormatter } from '../../utils';
import { MoneyContext } from '../../Contexts';

const currencies = require('../../currencies.json');

const AdminConsole = () => {
	const {exchangeRates, currency} = useContext(MoneyContext);

	const [requests, setRequests] = useState([]);
	const [force,update] = useState(0);
	const reload = () => update(Math.random());

	const [suppliers, setSuppliers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [admins, setAdmins] = useState([]);
	const [tags, setTags] = useState([]);

	const [purchaseData, setPurchaseData] = useState(getTimeData('year'));
	const [purchases, setPurchases] = useState([]);
	const [purchaseYAxis, setPurchaseYAxis] = useState('money');
	const [isSum, setIsSum] = useState('sum');
	const [isSupplierPopup, setIsSupplierPopup] = useState(false);

	const [loginData, setLoginData] = useState(getTimeData('week'));
	const [logins, setLogins] = useState([]);


	const [userNumberData, setUserNumberData] = useState([]);

	const [selectedReq, setSelectedReq] = useState(null);
	const [selectedMessage, setSelectedMessage] = useState(null);

	const changePurchaseTimeFrame = (e) => setPurchaseData(getTimeData(e.target.value));
	const changeLoginTimeFrame = (e) => setLoginData(getTimeData(e.target.value));

	useEffect(() => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/supplier/request`).then(res=>res.json()).then(req=>{
			setRequests(req.reverse());
		});
		fetch(`${process.env.REACT_APP_SERVER_URL}/message/`).then(res=>res.json()).then(m=>{
			setMessages(m);
		});
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/admins`).then(res=>res.json()).then(a=>{
			setAdmins(a);
		});
		fetch(`${process.env.REACT_APP_SERVER_URL}/tag/get`).then(res=>res.json()).then(t=>{
			setTags(t);
		});

		fetch(`${process.env.REACT_APP_SERVER_URL}/user/numbers`).then(res=>res.json()).then(data=>{
			setUserNumberData(data);
		});
	}, [force])

	useEffect(()=>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/suppliers`).then(res=>res.json()).then(s=>{
			setSuppliers(s.map(s=>({...s, checked: true})));
		});
	}, [])

	useEffect(()=>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/supplier/purchases/time`,{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				type: purchaseYAxis,
				...purchaseData
			})
		}).then(res=>res.json()).then(data=>{
			const dates = [...new Set(data.map(d=>d[0]))];
			const p = dates.map(date=>{
				const dateData = data.filter(d=>d[0]===date).map(d=>[d[1],d[2],d[3]]).sort((a,b)=>b[0]-a[0]).filter((d,i)=>{
					const supplier = suppliers.find(s=>s._id===d[1])||{checked: false}
					return suppliers.length&&supplier.checked
				});
				return [date, isSum==='sum' ? dateData.map(d=>d[0]).reduce((partialSum, a) => partialSum + a, 0) : dateData]
			})
			setPurchases(p);
		});
	}, [isSum, purchaseData, purchaseYAxis, suppliers])

	useEffect(()=>{
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/logins/time`,{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				...loginData
			})
		}).then(res=>res.json()).then(data=>{
			setLogins(data);
		});
	}, [loginData, force])

	const checkSupplier = (id) => {
		const amountChecked = suppliers.reduce((amount, s)=>s.checked?amount+1:amount, 0);
		if(amountChecked===1&&suppliers.find(s=>s._id===id).checked)
			return;
		setSuppliers(suppliers.map(s=>({...s, checked: (s._id === id ? !s.checked : s.checked)})))
	}

	return <div>
		<h1>Admin Console</h1>
		<div className='dashboard'>
			<div className='dashboardContainer' onMouseLeave={()=>setSelectedReq(null)}>
				<h2 className='dashboardHeader'>Supplier Requests</h2>
				<div className='dashboardList'>
					<table>
						<tbody>
							<tr className='dashboardListItem adminTblHeader'>
								<th>Company Name</th>
								<th>Phone</th>
								<th>Date</th>
								<th>Status</th>
							</tr>
							{
								requests.map((request, i)=><RequestListItem request={request} key={i} reload={reload} selectedReq={selectedReq} setSelectedReq={setSelectedReq}/>)
							}
						</tbody>
					</table>
					{requests.length===0&&<h3>No Requests</h3>}
				</div>
			</div>
			<div className='dashboardContainer'>
				<h2 className='dashboardHeader'>Suppliers</h2>
				<div className='dashboardList'>
					<table>
						<tbody>
							<tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "#b59c9c"}}>
								<th style={{backgroundColor: "#b59c9c"}}>Company Name</th>
								<th style={{backgroundColor: "#b59c9c"}}>Phone</th>
								<th style={{backgroundColor: "#b59c9c"}}>Email</th>
								<th style={{backgroundColor: "#b59c9c"}}>Action</th>
							</tr>
							{
								suppliers.map((supplier, i)=><SupplierListItem supplier={supplier} key={i} reload={reload}/>)
							}
						</tbody>
					</table>
					{suppliers.length===0&&<h3>No Suppliers</h3>}
				</div>
			</div>
			<div className='dashboardContainer' onMouseLeave={()=>setSelectedMessage(null)}>
				<div className='dashboardHeaderContainer' style={{position: "relative"}}>
					<h2 className='dashboardHeader'>Messages</h2>
					<CreateMessage reload={reload}/>
				</div>

				<div className='dashboardList'>
					<table>
						<tbody>
							<tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "white"}}>
								<th style={{backgroundColor: "white"}}>To</th>
								<th style={{backgroundColor: "white"}}>Subject</th>
								<th style={{backgroundColor: "white"}}>Date</th>
							</tr>
							{
								messages.map((message, i)=><MessageListItem message={message} key={i} reload={reload} selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage}/>)
							}
						</tbody>
					</table>
					{messages.length===0&&<h3>No Messages</h3>}
				</div>
			</div>
			<div className='dashboardContainer'>
				<div className='dashboardHeaderContainer' style={{position: "relative"}}>
					<h2 className='dashboardHeader'>Admins</h2>
					<CreateAdmin reload={reload}/>
				</div>

				<div className='dashboardList'>
					<table>
						<tbody>
							<tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "black", color: "white"}}>
								<th style={{backgroundColor: "black"}}>Name</th>
								<th style={{backgroundColor: "black"}}>Email</th>
								<th style={{backgroundColor: "black"}}>Phone</th>
								<th style={{backgroundColor: "black"}}> </th>
							</tr>
							{
								admins.map((admin, i)=><AdminListItem admin={admin} key={i} reload={reload}/>)
							}
						</tbody>
					</table>
				</div>
			</div>
			<div className='dashboardContainer'>
				<div className='dashboardHeaderContainer' style={{position: "relative"}}>
					<h2 className='dashboardHeader'>Tags</h2>
					<CreateTag reload={reload}/>
				</div>

				<div className='dashboardList'>
					<table>
						<tbody>
							<tr className='dashboardListItem adminTblHeader' style={{backgroundColor: "#a7c9ba"}}>
								<th style={{backgroundColor: "#a7c9ba"}}>Text</th>
								<th style={{backgroundColor: "#a7c9ba"}}>Background</th>
								<th style={{backgroundColor: "#a7c9ba"}}> </th>
							</tr>
							{
								tags.map((tag, i)=><TagListItem tag={tag} key={i} reload={reload}/>)
							}
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<h2>Statistics</h2>
		<div className='dashboard'>
			<div className='dashboardContainer'>
				<h2 className='dashboardHeader'>User Type Ratio</h2>
				<PieChart data={userNumberData}  height={540} margin={5}/>
			</div>
			<div className='dashboardContainer'>
				<div className='dashboardHeaderContainer' style={{position: "relative"}}>
					<h2 className='dashboardHeader'>Purchases</h2>
					<div style={{display: "flex", gap: "10px"}}>
						<select onChange={(e)=>setIsSum(e.target.value)} value={isSum} className='select1'>
							<option value='sum'>Sum</option>
							<option value='relation'>Relation</option>
						</select>
						<select onChange={(e)=>setPurchaseYAxis(e.target.value)} value={purchaseYAxis} className='select1'>
							<option value="money">Income</option>
							<option value="amount">Amount</option>
						</select>
						<select onChange={changePurchaseTimeFrame} value={purchaseData.timeFrame} className='select1'>
							<option value="year">Last Year</option>
							<option value="month">Last Month</option>
							<option value="week">Last week</option>
						</select>
					</div>
					<div className={'popup requestPopup supplierPopup ' + (isSupplierPopup ? 'scale1' : '')}>
						<div className='arrowUp centerAbsolute'/>
						<h2>Suppliers</h2>
						<table style={{margin: "auto"}}>
							<tbody>
								{
								suppliers.map((supplier, i)=>(
									<tr key={i} style={{display: "flex"}}>
										<td className="checkbox1">
											<input checked={supplier.checked} id={'supplierCheck_' + supplier._id} className="substituted" type="checkbox" aria-hidden="true" 
												onChange={()=>checkSupplier(supplier._id)}/>
											<label htmlFor={'supplierCheck_' + supplier._id}></label>
										</td>
										<td>
											<label>{supplier.fullName}</label>
										</td>
									</tr>
								))
							}
							</tbody>
						</table>
					</div>
					{isSupplierPopup&&<div className='allScreen' onClick={()=>setIsSupplierPopup(false)}/>}
				</div>
				<BarGraph 
					height={520} content={purchases} 
					timeFrame={purchaseData.timeFrame} color={isSum==='sum' ? (purchaseYAxis==='money' ?'#4dab66' : '#518194') : null}
					yAxisTickFormat={d=>{
						return purchaseYAxis==='money' ?  nFormatter(d*exchangeRates[currency]) + currencies[currency].symbol : (Math.floor(d)===d ? nFormatter(d) : '')
					}} namesButtonText='+ suppliers'
					onTagClick={()=>setIsSupplierPopup(true)}
				/>
			</div>
			<div className='dashboardContainer'>
				<div className='dashboardHeaderContainer' style={{position: "relative"}}>
					<h2 className='dashboardHeader'>Logins Over Time</h2>
					<select onChange={changeLoginTimeFrame} value={loginData.timeFrame} className='select1'>
						<option value="year">Last Year</option>
						<option value="month">Last Month</option>
						<option value="week">Last week</option>
					</select>
				</div>
				<BarGraph 
					height={520} content={logins} 
					timeFrame={loginData.timeFrame} color={'#518194'}
					yAxisTickFormat={d=>(Math.floor(d)===d ? nFormatter(d) : '')}
				/>
			</div>
		</div>
	</div>
}

export default AdminConsole;