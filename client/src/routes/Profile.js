import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import './Profile.css'
import './Page.css'

import DefaultImage from '../images/default-profile-picture.png'

import Comment from '../components/Comment.js'
import Navbar from '../components/Navbar.js'
import Follow from '../components/Follow.js'
import Stat from '../components/Stat.js'
import RecentGame from '../components/RecentGame.js'


function Profile() {

	const [comments, setComments] = useState([]);
	const [followers, setFollowers] = useState([]);
	const [stats, setStats] = useState([]);
	const [recentGames, setRecentGames] = useState([]);
	const [validToken, setValidToken] = useState(false);

	let params = useParams();
	
	let token = localStorage.getItem('token');
	let sessionUsername = localStorage.getItem('username');
	let profileUsername = params.username;
	let commentBox;
	let followButton;
	console.log(token);
	console.log(sessionUsername);

	// Load all of the followers for the current profile
	useEffect(() => {
		fetch(`http://localhost:8080/${profileUsername}/getFollows`)
			.then(response => response.json())
			.then(data => setFollowers([...data]))
			.catch(err => {
				console.log("Error when rendering followers:", err);
			})
	}, [profileUsername]);
	
	// Load all of the comments for the current profile
	useEffect(() => {
		fetch(`http://localhost:8080/${profileUsername}/comments`)
			.then(response => response.json())
			.then(data => setComments([...data]))
			.catch(err => {
				console.log("Error when rendering comments:", err);
			})
	}, [profileUsername]);

	// Load the stats for the current profile
	useEffect(() => {
		fetch(`http://localhost:8080/${profileUsername}/getStats`)
			.then(response => response.json())
			.then(data => setStats(data))
			.catch(err => {
				console.log("Error when rendering stats:", err);
			})
	}, [profileUsername]);

	// Load the recent games for the current profile
	useEffect(() => {
		fetch(`http://localhost:8080/${profileUsername}/getRecentGames`)
			.then(response => response.json())
			.then(data => setRecentGames(data))
			.catch(err => {
				console.log("Error when rendering recent games:", err);
			})
	}, [profileUsername]);

	useEffect(() => {
		fetch(`http://localhost:8080/validateToken/${token}/${sessionUsername}`)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				setValidToken(data.login);
			})
			.catch(err => {
				console.log("Error when validating token:", err);
			})
	}, [sessionUsername, token]);

	if (validToken) {
		// validate the login token
		commentBox = <form action="http://localhost:8080/addComment" method="POST">
						<input type="hidden" name="profileOwner" value={profileUsername}/>
						<input type="hidden" name="commenter" value={sessionUsername}/>
						<textarea type="text" name="text" className="comment-input" placeholder="Write a new comment..."/>
						<input type="submit" className="button post-button blue-button" value="Post Comment"/>
					</form>

		followButton = <form action="http://localhost:8080/follow" method="POST">
							<input type="hidden" name="profileOwner" value={profileUsername}/>
							<input type="hidden" name="follower" value={sessionUsername}/>
							<input type="submit" className="button follow-button blue-button" value="+Follower"/>
						</form>
	}
	else {
		console.log("login token not valid");
		commentBox = <div/>;
		followButton = <div/>;
	}
		
	return(
		<body>
			<Navbar/>
			<div className="content-wrapper">
				<div className="container profile-owner-container">
					<img src={DefaultImage} className="profile-picture" alt="user"/>
					<div className="profile-owner-username">{profileUsername}</div>
				</div>
				<div className="row">
					<div className="container follower-container">
							<div className="row">
								<u className="header">Following</u>
								{followButton}
							</div>
							<div className="follower-grid">
								{followers.map(follower => {
									return <Follow follower={follower.profileOwner}/>
								})}
							</div>
					</div>
					<div className="column">
						<div className="container stats-container">
							{stats.map(stat => {
								return <Stat gamesPlayed={stat.gamesPlayed}
											rankScore={Math.trunc(stat.rankScore)}
											averageWPM={Math.trunc(stat.averageWPM)}
											averageAccuracy={Math.trunc(stat.averageAccuracy)}
										/>
							})}
						</div>
						<div className="container recent-games-container">
							<u className="header">Recent Games</u>
							{recentGames.map(recentGame => {
								return <RecentGame
											WPM={Math.trunc(recentGame.WPM)}
											accuracy={Math.trunc(recentGame.accuracy)}
											/*date={recentGame.date}*/
										/>
							})}
						</div>
					</div>
				</div>
				<div className="container comments-container">
					<u className="header">Comments</u>
					{commentBox}
					{comments.map(comment => {
						return <Comment commenter={comment.commenter} text={comment.text} date={comment.date}/>
					})}
				</div>
			</div>
		</body>
	)
}

export default Profile