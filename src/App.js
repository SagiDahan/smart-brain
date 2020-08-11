import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
}

const initialState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'signin', // keeps track of where we are on the page
	isSignedIn: false,
	user: {
		id:'',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
}
class App extends Component {
	// we need to detect what the user enters in the ImageLinkForm
	// so we need to create state so that our app knows what the value is the the user enters, remembers it and updates it every time it get changed.
	// in order to do that we will define a constructor, within the constructor we call super() to be able to use "this"
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({user: {
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		}})
	}

	// communicate with server
	// componentDidMount() {
	// 	fetch('http://localhost:3000/')
	// 		.then(response => response.json())
	// 		.then(console.log)
	// }

	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputimage');
		const width = Number(image.width);
		const height = Number(image.height);
		// we want to return here an object, and this object is gonna be whats going to fill up the box state. this object will first need to figure out the first dot then the second dot then the third dot then the fourth dot and we are going to wrap it in a border.
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - (clarifaiFace.right_col * width),
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		console.log(box);
		this.setState({box: box});
	}

	onInputChange = (event) => {
		this.setState({input: event.target.value});
	}

	onButtonSubmit = () => {
		this.setState({imageUrl: this.state.input});
		// receive the body with the url
		fetch('https://desolate-dusk-95005.herokuapp.com/imageurl', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				input: this.state.input
			})
		})
		.then(response => response.json())
		.then(response => {
			if (response) {
				fetch('https://desolate-dusk-95005.herokuapp.com/image', {
					method: 'put',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						id: this.state.user.id
					})
				})
				.then(response => response.json())
				.then(count => {
					this.setState(Object.assign(this.state.user, { entries: count}))
				})
				.catch(console.log)
			}
			this.displayFaceBox(this.calculateFaceLocation(response))
		})
		.catch(err => console.log(err))
	}

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState(initialState)
		} else if (route === 'home') {
			this.setState({isSignedIn: true})
		}
		this.setState({route: route});
	}

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home' 
        	? <div>
			      	<Logo />
			        <Rank name={this.state.user.name} entries={this.state.user.entries} />
			        <ImageLinkForm 
				        onInputChange={this.onInputChange} 
				        onButtonSubmit={this.onButtonSubmit}
			        />
			        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
		        </div>
        	: (
        			this.state.route === 'signin'
        			? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        			: <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        		)
		        
      	}
      </div>
    );
  }
  
}

export default App;
