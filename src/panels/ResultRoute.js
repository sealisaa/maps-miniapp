import React from 'react';
import { Panel } from '@vkontakte/vkui';
import './style.css';

function getDistance(multiRoute, i, j) {
    console.log(multiRoute);
    console.log(i);
    console.log(j);
//    var activeRoute = multiRoute.getActiveRoute();
//    var distance = activeRoute.properties.get("distance").value;
//    console.log(i + " " + j);
//    console.log(arrDistances[i][j]);
}

function getDistanceMap(places) {
    var arrKeys = Array.from(places.keys());
    var arrValues = Array.from(places.values());
    var arrDistances = [];
    for (var i = 0; i < arrKeys.length; i++) {
        arrDistances[i] = [];
        for (var j = 0; j < arrKeys.length; j++) {
            arrDistances[i][j] = -1;
        }
    }
    //расстояния в обе стороны могут быть разные, надо учесть
    for (var i = 0; i < arrKeys.length; i++) {
        for (var j = i + 1; j < arrKeys.length; j++) {
            console.log(ymaps.coordSystem.geo.getDistance(arrValues[i], arrValues[j]));
            /*var multiRoute = new ymaps.multiRouter.MultiRoute({
                referencePoints: [
                    arrValues[i],
                    arrValues[j]
                ],
                params: {
                    routingMode: 'pedestrian'
                }
            });
            multiRoute.model.events.add('requestsuccess', (multiRoute) => getDistance(multiRoute, i, j));*/
        }
    }
}

class ResultRoute extends React.Component {
	constructor(props) {
		super(props);
		var places = this.props.places;
		getDistanceMap(places);
	}

	render() {
		return(
		<Panel className="panel">
		    <div className="basic-container">Тут будет маршрут</div>
		</Panel>)
	}
};

export default ResultRoute;