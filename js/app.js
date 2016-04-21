// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"
import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'
import Firebase from 'firebase'

var ref = new Firebase("https://gifthorse.firebaseio.com/")

var UserModel = Backbone.Firebase.Model.extend({
	initialize: function(uid) {
		this.url = `https://gifthorse.firebaseio.com/users/${uid}`
	}
})	

var AutoComplete = Backbone.Firebase.Collection.extend({
	initialize: function(targetEmail) {

		if(targetEmail.length > 0) {

		this.url = ref.child("users").orderByChild("email").startAt(targetEmail).endAt(targetEmail+"\uf8ff").limitToFirst(20)
	}

		if(targetEmail.length <= 0) {

		targetEmail = " "

			this.url = ref.child("users").orderByChild("email").startAt(targetEmail).endAt(targetEmail+"\uf8ff").limitToFirst(20)
		}			
	},
	autoSync: false
})

var QueryByEmail = Backbone.Firebase.Collection.extend({

	initialize: function(targetEmail) {
		this.url = ref.child("users").orderByChild("email").equalTo(targetEmail)
	},
	autoSync: false
})

var GiftHorses = Backbone.Firebase.Collection.extend({
	initialize: function(uid) {
		this.url = `https://gifthorse.firebaseio.com/users/${uid}/stable`
	}
})

var StableView = React.createClass({

componentWillMount: function() {
		var self = this
		this.props.giftHorseColl.on("sync", function() {
			self.forceUpdate()
		})
	},

componentWillUnmount: function() {
		clearInterval(this.interval)
	},	

	render: function() {

		return (
			<div className="currentView">
				<div className="dashboard">
					<p>Welcome {ref.getAuth().password.email.split("@")[0]}!</p>
					
					<a href="#hoofbeats">hoofbeats!</a>
					<a href="#stable">your stable</a>
					<a href="#send">send a gifthorse</a>
					<a href="#logout" >log out</a>
				</div>		
				<div className="viewView">
					<Stable giftHorseColl={this.props.giftHorseColl}/> 
				</div>
			</div>	
		)
	}			
})

var HoofBeatsView = React.createClass({

	componentWillMount: function() {
		var self = this
		this.props.giftHorseColl.on("sync", function() {
			self.forceUpdate()
		})
	},

	render: function() {

		return (
			<div className="currentView">
				<div className="dashboard">
					<p>Welcome {ref.getAuth().password.email.split("@")[0]}!</p>
					
					<a href="#hoofbeats">hoofbeats!</a>
					<a href="#stable">your stable</a>
					<a href="#send">send a gifthorse</a>
					<a href="#logout" >log out</a>
				</div>	
				<div className="viewView">
					<Hoofbeats giftHorseColl={this.props.giftHorseColl} />
				</div>
			</div>		
		)
	}
})

var Stable = React.createClass({

	_showGiftHorse: function(mod,i) {
		return <YourGiftHorses giftHorseData={mod} key={i} />
	},

	render: function() {
		return (
			<div className="stable">
				{this.props.giftHorseColl.map(this._showGiftHorse).reverse()}
			</div>	
		)
	}
})

var Hoofbeats = React.createClass({

	_showGiftHorse: function(mod,i) {
		return <IncomingGiftHorse giftHorseData={mod} key={i} />
	},

	render: function() {
		return (
			<div className="hoofbeats">
				{this.props.giftHorseColl.map(this._showGiftHorse).reverse()}
			</div>	
		)
	}
})

var IncomingGiftHorse = React.createClass({
	
	componentWillMount: function() {
		var self = this
		this.interval = setInterval(
			function() {
				self.setState({
					now: Date.now()
				})
			}, 1000)
	},

	componentWillUnmount: function() {
		clearInterval(this.interval)
	},

	getInitialState: function() {
		return {
			now: Date.now()
		}
	},

	render: function() {

		var displayType = "block"
		var backgroundColor = "rgba(240,248,255,.55)"
		var messageText = this.props.giftHorseData.get("content") 

		var userName = this.props.giftHorseData.get("sender_email")
		var senderImage = this.props.giftHorseData.get("sender_image")
		var recipientImage = ref.getAuth().password.profileImageURL	

		var giftLink = this.props.giftHorseData.get("reward_link")

		var openDate = this.props.giftHorseData.get("open_date")
		var dateConverter = new Date(openDate)
		var openDateMM = dateConverter.getTime()

		var timezoneOffset = dateConverter.getTimezoneOffset()
		var adjustment = timezoneOffset * 60000
		var OpenAsLocalTimeMM = openDateMM + adjustment
		var localOpenDateTime = new Date(OpenAsLocalTimeMM)


		var openDateMM = dateConverter.getTime()
		var sentDate = this.props.giftHorseData.get("sent_date")

		var readableSentDate = new Date(sentDate).toLocaleDateString()
		var readableSentTime = new Date(sentDate).toLocaleTimeString()
		var readableOpenDate = new Date(localOpenDateTime).toLocaleDateString()

		var readableOpenTime = new Date(localOpenDateTime).toLocaleTimeString()

		var localSentDateTime = readableSentDate + " " + readableSentTime

		var localOpenDateTime = readableOpenDate + " " + readableOpenTime 

		var current = this.state.now

		// if (userName !== undefined)

		// userName = userName.split("@")[0]

		if (current >= OpenAsLocalTimeMM) 
			backgroundColor = "green",

			displayType = "none"

			

			// displayType = "none"
			// messageText = "Do not open until: " + localOpenDateTime
		
		if(current < OpenAsLocalTimeMM) 
			backgroundColor = "rgba(240,248,255,.55)",
			messageText = "Do not open until: " + localOpenDateTime
	
		if (this.props.giftHorseData.id === undefined) 
			displayType = "none"
		

		return (
			<div style={{display:displayType, background: backgroundColor}}
				className="incomingMessage" >

				<div className="giftHeader">
					<img className="senderImage" src={senderImage}/>
					<div className="giftInfo">
					
					<p className="author">from: {userName}</p>
					<p className="sentDate">sent: {localSentDateTime}</p>
				</div>	
					<div className="progressTracker">
							<ProgressBar openDate={OpenAsLocalTimeMM} sentDate={this.props.giftHorseData.get("sent_date")}/>
						</div>
					<img className="recipientImage" src={recipientImage}/>
				<p className="content">{messageText}</p>
			</div>	
			</div>
		)
	}	
})

var ProgressBar = React.createClass({

	_progressFunc: function(sendDate, openDate){
		
		var send = new Date(sendDate)
		var get = new Date(openDate)
		var distance = get - send

		var current = this.state.now

		var prog = current - send

		var completeness = prog/distance

		var percentage = completeness.toPrecision(4) * 100

		return percentage

	},

	componentWillMount: function() {
		var self = this
		this.interval = setInterval(
			function() {
				self.setState({
					now: Date.now()
				})
			}, 1000)
	},

	componentWillUnmount: function() {
		clearInterval(this.interval)
	},

	getInitialState: function() {
		return {
			now: Date.now()
		}
	},

	render: function(){

		var progressStyle = {}

		progressStyle.width = this._progressFunc(this.props.sentDate,this.props.openDate) + "%"

		// if (progressStyle.width > "100%") {
		// 	clearInterval(this.interval)
		// }

		// if (this.state.now >= this.props.openDate)
			// this.componentWillUnmount

		return(
			<div className="timeLine">
   				<div style={progressStyle} className="progressBar">
   				<div className="giftHorse"><img src="./images/gifthorse.gif"/>
							</div>
  					<div className="howMuchLonger">
  					</div>
      			</div>
			</div>
		)
	}

// var intervalID = window.setInterval(function() {progressIncreaser("2016-4-17 00:00","2016-4-17 18:52")}, 1000)

})

var YourGiftHorses = React.createClass({

	componentWillMount: function() {
		var self = this
		this.interval = setInterval(
			function() {
				self.setState({
					now: Date.now()
				})
			}, 1000)
	},

	componentWillUnmount: function() {
		clearInterval(this.interval)
	},

	getInitialState: function() {
		return {
			now: Date.now()
		}
	},

	render: function() {

		var displayType = "block"
		var backgroundColor = "rgba(240,248,255,.55)"
		var senderImage = this.props.giftHorseData.get("sender_image")
		var messageText = this.props.giftHorseData.get("content") 

		var userName = this.props.giftHorseData.get("sender_email")

		var giftLink = this.props.giftHorseData.get("reward_link")
		
		var recipientImage = ref.getAuth().password.profileImageURL	

		var openDate = this.props.giftHorseData.get("open_date")
		var dateConverter = new Date(openDate)
		var openDateMM = dateConverter.getTime()

		var timezoneOffset = dateConverter.getTimezoneOffset()
		var adjustment = timezoneOffset * 60000
		var OpenAsLocalTimeMM = openDateMM + adjustment
		var localOpenDateTime = new Date(OpenAsLocalTimeMM)


		var openDateMM = dateConverter.getTime()
		var sentDate = this.props.giftHorseData.get("sent_date")

		var readableSentDate = new Date(sentDate).toLocaleDateString()
		var readableSentTime = new Date(sentDate).toLocaleTimeString()
		var readableOpenDate = new Date(localOpenDateTime).toLocaleDateString()

		var readableOpenTime = new Date(localOpenDateTime).toLocaleTimeString()

		var localSentDateTime = readableSentDate + " " + readableSentTime

		var localOpenDateTime = readableOpenDate + " " + readableOpenTime 

		var current = this.state.now

		// if (userName !== undefined)

		// userName = userName.split("@")[0]

		// if (current <= openDateMM) 
		// 	backgroundColor = "green"




		if(current < OpenAsLocalTimeMM) 
			backgroundColor = "rgba(240,248,255,.55)",
			messageText = "A surprise is coming on " + localOpenDateTime + "!",
			displayType = "none"
	
		if (this.props.giftHorseData.id === undefined) 
			displayType = "none"


		return (
			<div style={{display:displayType, background: backgroundColor}}
				className="message" >
				<div className="giftHeader">
					<img className="senderImage" src={senderImage}/>
					<div className="giftInfo">
					<p className="author">from: {this.props.giftHorseData.get("sender_email")}</p>

					<p className="sentDate">sent: {localSentDateTime}</p>
					</div>
				</div>
						
				
				
				<p className="content">{messageText}</p>
				<a style={{display:displayType}} href={giftLink}>Your Gift!</a>
			</div>	
		)
	}	
})

var SelectItem = React.createClass({

	_searchName: function() {
		
		console.log("BUTTS")
	},

	render: function(){

		return (
			<div className="listItem">
			<li onClick={this._searchName}>{this.props.selData}</li>
			</div>
		)
	}
})

var SenderView = React.createClass({

	targetEmail: "",
	msg: "",
	rewardLink: "",
	sendDate: "",
	openDate: "",

	_setTargetEmail: function(e) {

		this.targetEmail = e.target.value
		
		var results = new AutoComplete(this.targetEmail)

		var self = this

		results.fetch()	

		results.on("sync", function() {
			
			var LIs = results.map(function(sel, j){

				console.log(sel.attributes.email)

				if(sel.get("email"))
				
				return <li name={sel.get("email")} key={j}>{sel.get("email")}</li>
			})

			self.setState({
				names: LIs
			})
		})
	},

	_setMsg: function(e) {
		this.msg = e.target.value
	},

	_setOpenDate: function(e) {
		this.openDate = e.target.value
	},

	_setRewardLink: function(e) {
		this.rewardLink = e.target.value
	},

	_submitMessage: function() {

		var queriedUsers = new QueryByEmail(this.targetEmail)

		var self = this

		if(self.targetEmail === undefined || self.targetEmail === "" ) {
			alert("Enter a valid email address.") 
			return
		}

		if (self.openDate === "" || self.openDate === undefined || self.date < Date.now()) {
			alert("Select a valid date starting from today.") 
			return
		}	
		if (self.msg === "") {
			alert("Message is blank!") 
			return

		} else {
			queriedUsers.fetch()
			queriedUsers.on("sync", function() {

				if (queriedUsers.models.length === 0) {
			alert("That user does not exist.") 
			return

			} else {

				var userId = queriedUsers.models[0].get("id")

				// var sentDate = self.props.currentDate

					var GiftHorseCollection = new GiftHorses(userId)
					GiftHorseCollection.create({
						content: self.msg,
						sender_email: ref.getAuth().password.email,
						open_date: self.openDate,
						sender_id: ref.getAuth().uid,
						sender_image: ref.getAuth().password.profileImageURL,
						sent_date: Date.now(),
						reward_link: self.rewardLink
					})

					self.targetEmail = ""
					self.msg = ""
					self.openDate = ""
					self.rewardLink = ""

					self.refs.targetEmail.value = ""
					self.refs.msg.value = ""
					self.refs.openDate.value = ""
					self.refs.rewardLink.value = ""

					self.state.names = []
					
					alert("message sent!")

					return
				}			
			})	
		}		
    },

    getInitialState: function() {

    	 return {names: []};
    },	 

    test: function() {
    	console.log("hey!")
    },

	render: function() {

		return (

			<div className="currentView">
				<div className="dashboard">
						<p>Welcome {ref.getAuth().password.email.split("@")[0]}!</p>
						
						<a href="#hoofbeats">hoofbeats!</a>
						<a href="#stable">your stable</a>
						<a href="#send">send a gifthorse</a>
						<a href="#logout" >log out</a>
				</div>
				<div className="viewView">
					<div className="sender">
						<div className="sendContainer">
						<p className="senderText">Send a GiftHorse</p>
						<input onmouseenter={this._test} className="emailer" ref="targetEmail" placeholder="recipient's email address" onChange={this._setTargetEmail} />
						
							<div className="selectList">
								{this.state.names}
							</div>
						<input ref="rewardLink" className="rewardLinker" type="url" placeholder="gift URL" onChange={this._setRewardLink} required pattern="https?://.+"/>
						<textarea ref="msg" placeholder="attach a message..." onChange={this._setMsg} />
						<p className="senderText">Date To Be Opened:</p>
		  				<input type="datetime-local" ref="openDate" min={Date.now()} onChange={this._setOpenDate} />
						<button className="submitter" sentDate={this.sentDate} onClick={this._submitMessage} > submit!</button>
						</div>
					<img className="giftHorseSender" src="./images/gifthorse.gif"/>	
					</div>

				</div>
			</div>			
		)
	}
})

var SplashPage = React.createClass({
	email: "",
	password: "",

	_handleSignUp: function() {
		this.props.createUser(this.email,this.password)
	},

	_handleLogIn: function() {
		this.props.logUserIn(this.email, this.password)
	},

	_updateEmail: function(event) {
		this.email = event.target.value 
	},

	_updatePassword: function(event) {
		this.password = event.target.value
	},

	render: function() {
		return (
			<div className="loginContainer">
				<img className="giftHorseLogin" src="./images/gifthorse.gif"/>
				<h1 className="appTitle">GiftHorse</h1>
				<input type="email" name="email" placeholder="enter your email" onChange={this._updateEmail} required />
				<input type="text" name="password"placeholder="your password" onChange={this._updatePassword} type="password" required />
				<div className="splashButtons">
					<button onClick={this._handleLogIn}> log in</button>
					<button onClick={this._handleSignUp} >sign up</button>
				</div>	
			</div>	
		)
	}
})

function app() {
    // start app
    // new Router()

    var GiftHorseRouter = Backbone.Router.extend({
    	routes: {
    		"splash" : "_showSplashPage",
    		"hoofbeats" : "_showHoofBeatsView",
    		"stable" : "_showStableView",
    		"send" : "_showSendView",
    		"logout" : "_handleLogOut",
    		"*default" : "_showSplashPage",
    	},

    	initialize: function() {
    		this.ref = new Firebase("https://gifthorse.firebaseio.com/")
    		window.ref = this.ref

    	if (!this.ref.getAuth()) {
                location.hash = "splash"
            }	

    	this.on("route", function() {	
    		if (!this.ref.getAuth()) {
    			location.hash = "splash"
    		}
    	})	
    },

    _handleLogOut: function() {
    	this.ref.unauth()
    	location.hash = "splash"
    },

    _showSplashPage: function() {
    	DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)}
    		createUser={this._createUser.bind(this)} />, document.querySelector(".container"))
    },

    _showHoofBeatsView: function() {
    	var uid = ref.getAuth().uid
    	var giftHorseColl = new GiftHorses(uid)
    	
    	DOM.render(<HoofBeatsView giftHorseColl={giftHorseColl}/>, document.querySelector(".container"))
    },

    _showStableView: function() {
    	var uid = ref.getAuth().uid
    	var giftHorseColl = new GiftHorses(uid)

    	DOM.render(<StableView giftHorseColl={giftHorseColl}/>, document.querySelector(".container"))
    },

    _showSendView: function() {
    	var uid = ref.getAuth().uid
    	var giftHorseColl = new GiftHorses(uid)

    	DOM.render(<SenderView giftHorseColl={giftHorseColl}/>, document.querySelector(".container"))
    },

    _logUserIn: function(email,password){
    	console.log(email,password)
    	this.ref.authWithPassword({
    		email: email,
    		password: password
    	}, function(err, authData) {
    	   		if (err) console.log(err)
    			else {
    				location.hash = "hoofbeats"
    			}	
    		}	
    	)
    },

    _createUser: function(email,password) {
    	console.log(email, password)
    	var self = this
    	this.ref.createUser({
    		email: email,
    		password: password,
    	}, function(err, authData) {
    		if (err) console.log(err)
    		else {
    			var userMod = new UserModel(authData.uid)
    			userMod.set({
    				email: email,
    				id: authData.uid
    			})
    			self._logUserIn(email,password)
    		}		
    	})
    }
})
    var pr = new GiftHorseRouter()
    Backbone.history.start()
}

app()
