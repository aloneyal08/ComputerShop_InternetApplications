import React from 'react'
import './notFound.css'
import notFoundVideo from '../../images/404.mp4';


export const NotFound = () => {
	return (
		<div className="container">
			<video width="750" autoPlay muted loop src={notFoundVideo}/>
			<p id='first_for_notFound'>Oops! The page you are looking for does not exist.</p>
			<p id='second_for_notFound'>Please Make Sure You Wrote The Right URL!</p>
			<a href="/" className="home-button">Go Home</a>
		</div>
	);
}
