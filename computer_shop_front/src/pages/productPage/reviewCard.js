import React, {useState, useEffect} from 'react';
import { Rating } from 'react-simple-star-rating';
import './reviewCard.css';

export const ReviewCard = ({review}) => {
    const [user, setUser] = useState({});
    useEffect(() => {
        fetch('http://localhost:88/user/id-get',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: review.user})
        }).then((res)=>res.json()).then((res)=>{setUser(res);});
    }, []);
    return (
        <div className='reviewCard'>
            <h2 className='reviewTitle'>{review.title}</h2>
            {review.text === '<p></p>\n'?
                <></>
                :
                <div className='reviewDesc scrollBar2' dangerouslySetInnerHTML={{__html: review.text}}></div>
            }
            <footer className='reviewBottom'>
                <div className='reviewUser'>
                    <img alt='           ' src={user.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
                </div>
                <div>
                    <Rating
                    readonly={true}
                    initialValue={review.rating}
                    allowFraction={true}
                    size={35}
                    id='productRating'
                    />
                    <div className='reviewUnderText'>
                        <h5 className='userName'>{user.fullName}</h5>
                        <h5 className='reviewDate'>{new Date(review.date).toLocaleDateString()}</h5>
                    </div>
                </div>
            </footer>
        </div>
    );
};