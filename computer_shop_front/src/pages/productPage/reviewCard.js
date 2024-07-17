import React, {useState, useEffect} from 'react';
import ReactStarsRating from 'react-awesome-stars-rating';
import './reviewCard.css';

export const ReviewCard = ({review}) => {
	const [user, setUser] = useState({});
	useEffect(() => {
		fetch(`${process.env.REACT_APP_SERVER_URL}/user/id-get`,{
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({id: review.user})
		}).then((res)=>res.json()).then((res)=>{setUser(res);});
	}, [review.user]);
	return (
		<div className='reviewCard'>
			<header className='reviewTop'>
				<div className='reviewUser'>
					<img alt='           ' src={user.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
				</div>
				<div>
					<div className='reviewUnderText'>
						<h5 className='userName'>{user.fullName}</h5>
						<h5 className='reviewDate'>{new Date(review.date).toLocaleDateString()}</h5>
					</div>
				</div>
			</header>
			<div className='revTitleWrapper'>
				<ReactStarsRating 
					value={review.rating} 
					secondaryColor="#cccccc"
					primaryColor="#ffbc0b"
					isEdit={false}
					size={33}
					id={review._id}
				/> 
				<h2 className='reviewTitle'>{review.title}</h2>
			</div>
			{review.text === '<p></p>\n'?
				<></>
				:
				<div className='reviewDesc scrollBar2' dangerouslySetInnerHTML={{__html: review.text}}></div>
			}
		</div>
	);
};