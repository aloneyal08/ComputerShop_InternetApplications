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
      }).then((res)=>res.json()).then((res)=>{setUser(res);console.log(res)});
    }, []);
    return (
        <div className='reviewCard'>
            <div className='reviewDesc' dangerouslySetInnerHTML={{__html: review.text}}></div>
            <footer className='reviewBottom'>
                <div className='reviewUser'>
                    <img alt='           ' src={user.profilePhoto} onError={(e) =>{e.currentTarget.src = require('../../images/userDefault.png')}} />
                    <h4 className='userName'>{user.fullName}</h4>
                </div>
                <Rating
                readonly={true}
                initialValue={review.rating}
                allowFraction={true}
                size={35}
                id='productRating'
                />
            </footer>
            <h5 className='reviewDate'>{review.date}</h5>
        </div>
    );
};