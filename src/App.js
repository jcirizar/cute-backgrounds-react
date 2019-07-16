import React from 'react';
import './App.css';
import Flickr from './components/Flickr';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            interval: 20,
            tags: 'penguins'
        };

        this.handleTags = this.handleTags.bind(this);
    }

    handleTags(event) {
        this.setState({tags: event.target.value});
    }

    render() {
        return (
            <div className="app">
                <section className="content">
                    <h1>Cute Backgrounds</h1>

                    <Flickr interval={this.state.interval} tags={this.state.tags}>
                        <div className='input-group'>
                            <span>Background: </span><input type="text" value={this.state.tags} onChange={this.handleTags}/>
                        </div>
                    </Flickr>

                </section>
            </div>
        );
    }

}

export default App;
