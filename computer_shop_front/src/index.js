import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google"
import { BrowserRouter } from 'react-router-dom';
import { FacebookProvider } from 'react-facebook';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<FacebookProvider appId={process.env.REACT_APP_FACEBOOK_ID}>
		<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</GoogleOAuthProvider>
	</FacebookProvider>
);
