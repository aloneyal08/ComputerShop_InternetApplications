import React from 'react'
import './notFound.css'
import notFoundImage from '../../images/404.png';


export const NotFound = () => {
  return (
    <div className="container">
      <img src={notFoundImage} alt="404 Not Found" id="notFoundImage" />
      <p id='first_for_notFound'>Oops! The page you are looking for does not exist.</p>
      <p id='second_for_notFound'>Please Make Sure You Wrote The Right Url!</p>
      <a href="/" className="home-button">Go Home</a>
    </div>
  );
}
