import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import './style.css';

const PlacesList = ({places}) => {
    var names = Array.from(places.keys());
    return (
        <div className="basic-container">
            {names.map((k) => {
                return (
                    <p key={k}>{k}</p>
                )
            })}
        </div>
    )
}

class YandexMap extends React.Component {
    constructor(props) {
        super(props);
        this.places = this.props.places;
        this.addPlace = this.addPlace.bind(this);
        this.init = this.init.bind(this);
        ymaps.ready(this.init);
    }

    addPlace(e) {
        var point = e.get('target');
        var pointName = point.properties._data.name;
        if (this.places.has(pointName)) {
            point.options.set('preset', 'islands#blueIcon');
            this.places.delete(pointName);
        } else {
            point.options.set('preset', 'islands#redIcon');
            this.places.set(pointName, e.get('target').geometry.getCoordinates());
        }
        this.props.onChange();
    }

    init() {
        var map = new ymaps.Map('map', {
            center: [59.939099, 30.315877],
            zoom: 12,
            controls: []
        });

        var searchControl = new ymaps.control.SearchControl({
            options: {
                noPlacemark: true
            }
        });

        var searchResults = new ymaps.GeoObjectCollection(null, {
            hintContentLayout: ymaps.templateLayoutFactory.createClass('$[properties.name]'),
            hasBalloon: false
        });

        map.controls.add(searchControl);
        map.geoObjects.add(searchResults);

        searchResults.events.add('click', (e) => this.addPlace(e));
        searchControl.events.add('resultselect', function (e) {
            var index = e.get('index');
            searchControl.getResult(index).then(function (res) {
                searchResults.add(res);
            });
        }).add('submit', function () {
                searchResults.removeAll();
        });
    };

    render() {
        return(
            <div id="map" className="map-container"></div>
        )
    }
}

class MainMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {places: new Map(), changed: false};
		this.go = this.props.go;
	}

	onChange = () => {
      this.setState({changed: true});
    }

	render() {
		return(
		<Panel className="panel">
		    <PlacesList places={this.state.places} />
		    <Button size="m" mode="secondary" className="btn" onClick = {(e) => this.go(e, this.state.places)} data-to="resultRoute">Построить маршрут</Button>
		    <YandexMap places={this.state.places} onChange={this.onChange} />
		</Panel>)
	}
};

export default MainMap;