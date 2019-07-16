import React from 'react';
import './Flickr.css';
import {debounce} from 'lodash';

const flickrApiKey = '6dd24da25ccbc072d5b7161bd1a448cc';
const defaultProps = {
    tags: 'penguins',
    interval: 20,
    photos: {},
    currentIndex: 0,
    startFromTheBeginning: false
};

class Flickr extends React.Component {
    constructor(props) {
        super(props);
        this.state = defaultProps;
        this.debouncedGetPhotos = debounce(this.getPhotos, 500); // Debounced function to avoid to many request
    }

    static getDerivedStateFromProps({tags, interval}, state) {
        const newTags = Array.isArray(tags) ? tags.join(', ') : tags;

        return Object.assign({}, state, {
            tags: newTags,
            interval: interval
        });

    }

    startUpdatingPhotos() {
        this.setState({
            timer: setInterval(() => {

                this.setState({
                    currentIndex: this.state.currentIndex + 1
                });

            }, this.state.interval * 1000)
        })
    }

    componentDidMount() {
        this.getPhotos(this.state.tags, 1, true)
            .then(() => {
                this.startUpdatingPhotos();
            })
            .catch(console.error);
    }

    getPhotos(tags, page, initial = false) {

        if (tags === "") {
            tags = defaultProps.tags;
        }
        const baseUrl = `https://www.flickr.com/services/rest/`;
        const params = [
            ['api_key', flickrApiKey],
            ['method', 'flickr.photos.search'],
            ['tags', tags],
            ['tag_mode', 'all'],
            ['extras', 'url_l'],
            ['format', 'json'],
            ['nojsoncallback', '1'],
            ['per_page', '20'],
            ['page', page],
        ];

        const query = new URLSearchParams(params);
        return fetch(`${baseUrl}?${query.toString()}`)
            .then((res) => res.json())
            .then(({stat, photos}) => {

                const {photo, ...rest} = photos;
                const oldPhoto = this.state.photos.photo ? this.state.photos.photo : [];

                if (stat === 'ok') {
                    const stateToSet = {
                        photos: {
                            ...rest
                        }
                    };
                    if (initial) {
                        stateToSet['currentIndex'] = 0;
                        stateToSet.photos['photo'] = photo.filter((ph) => !!ph['url_l']) // Make sure flickr has this size available
                    } else {
                        stateToSet.photos['photo'] = [...oldPhoto, ...photo.filter((ph) => !!ph['url_l'])] // Make sure flickr has this size available
                    }

                    this.setState(stateToSet);
                }
                return Promise.resolve();
            })
    }

    getImageUrl() {
        if (this.state.photos.photo) {
            return this.state.photos.photo[this.state.currentIndex]['url_l'];
        } else {
            return '';
        }
    }

    render() {
        const backgroundImage = {
            backgroundImage: 'url(' + this.getImageUrl() + ')',
        };

        return (
            <div className="flickr" style={backgroundImage}>
                <div className="children-target">{this.props.children}</div>
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const currentAmountOfPhotos = this.state.photos.photo.length;

        if (currentAmountOfPhotos - this.state.currentIndex === 3) {
            if (this.state.photos.page < this.state.photos.pages) {
                void this.getPhotos(this.state.tags, this.state.photos.page + 1);
            }
        }
        if (this.state.currentIndex + 1 === this.state.photos.photo.length) {
            this.setState({currentIndex: 0});
        }

        if (prevProps.tags && prevProps.tags !== this.state.tags) {
            this.debouncedGetPhotos(this.state.tags, 1, true);
        }

    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }
}

export default Flickr;
