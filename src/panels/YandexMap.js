import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import './YandexMap.css';

const PlacesList = ({places}) => {
    var arr = Array.from(places.keys());
    return (
        <div className="places-container">
            {arr.map((k) => {
                return (
                    <p id={k}>{k}</p>
                )
            })}
        </div>
    )
}

class YMap extends React.Component {
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
        var myMap = new ymaps.Map('map', {
                center: [59.939099, 30.315877],
                zoom: 12,
                controls: []
            }),
            mySearchControl = new ymaps.control.SearchControl({
                options: {
                    noPlacemark: true
                }
            }),
            mySearchResults = new ymaps.GeoObjectCollection(null, {
                hintContentLayout: ymaps.templateLayoutFactory.createClass('$[properties.name]'),
                hasBalloon: false
            });
        myMap.controls.add(mySearchControl);
        myMap.geoObjects.add(mySearchResults);

        mySearchResults.events.add('click', (e) => this.addPlace(e));
        mySearchControl.events.add('resultselect', function (e) {
            var index = e.get('index');
            mySearchControl.getResult(index).then(function (res) {
                mySearchResults.add(res);
            });
        }).add('submit', function () {
                mySearchResults.removeAll();
        })
    };

    render() {
        return(
            <div id="map" className="map-container"></div>
        )
    }
}

class YandexMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {places: new Map(), changed: false};
		this.go = this.props.go;
		this.buildRoute = this.buildRoute.bind(this);
	}

	onChange = () => {
      this.setState({changed: true});
    }

    buildRoute(e, places) {
        console.log(e);
        console.log(places);
        this.go(e, places);
    }

	render() {
		return(
		<Panel className="panel">
		    <PlacesList places={this.state.places} />
		    <Button size="m" mode="secondary" className="btn" onClick = {(e) => this.go(e, this.state.places)} data-to="resultRoute">Построить маршрут</Button>
		    <YMap places={this.state.places} onChange={this.onChange} />
		</Panel>)
	}
};

export default YandexMap;