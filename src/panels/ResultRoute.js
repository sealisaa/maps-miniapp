import React from 'react';
import { Panel, PanelHeader, PanelHeaderBack, Group, Div } from '@vkontakte/vkui';
import './style.css';

var distances = [];
var arrKeys;
var arrValues;
var path = [];
var pathLength;
var sumPathLength = 0;
var visited = [];
var currentPath = [];
var currentPathLength;

function GreedyAlgorithmStart() {
	for (let i = 0; i < distances.length; i++) {
		for (let j = 0; j < distances.length; j++) {
			visited[j] = false;
		}
		visited[i] = true;
		currentPath = [i];
		currentPathLength = 0;
		GreedyAlgorithm(i);
		if (currentPathLength < pathLength) {
			path = currentPath;
			pathLength = currentPathLength;
		}
	}
}

function GreedyAlgorithm(i) {
	if (isAllVisited()) {
		return;
	}
	var currentMinDistance = sumPathLength;
	var currentMinEdge = -1;
	for (let j = 0; j < distances[i].length; j++) {
		if (distances[i][j] != -1 && !visited[j] && distances[i][j] < currentMinDistance) {
			currentMinDistance = distances[i][j];
			currentMinEdge = j;
		}
	}
	if (currentMinEdge != -1) {
		visited[currentMinEdge] = true;
		currentPath[currentPath.length] = currentMinEdge;
		currentPathLength += currentMinDistance;
		GreedyAlgorithm(currentMinEdge);
	}
}

function isAllVisited() {
	for (let i = 0; i < visited.length; i++) {
		if (!visited[i]) {
			return false;
		}
	}
	return true;
}

function getDistances(places) {
    for (var i = 0; i < arrKeys.length; i++) {
        distances[i] = [];
        for (var j = 0; j < arrKeys.length; j++) {
            distances[i][j] = -1;
        }
    }
    for (var i = 0; i < arrKeys.length; i++) {
        for (var j = i + 1; j < arrKeys.length; j++) {
            distances[i][j] = ymaps.coordSystem.geo.getDistance(arrValues[i], arrValues[j]);
            distances[j][i] = distances[i][j];
            sumPathLength += distances[i][j];
        }
    }
}

class ResultRoute extends React.Component {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.setDistanceAndDuration = this.setDistanceAndDuration.bind(this);
		this.go = this.props.go;
		var places = this.props.places;
		arrKeys = Array.from(places.keys());
        arrValues = Array.from(places.values());
		if (places.size > 2) {
		    getDistances(places);
            pathLength = sumPathLength;
            GreedyAlgorithmStart();
            var pathStr = arrKeys[path[0]];
            for (let i = 1; i < path.length; i++) {
                pathStr += " -> " + arrKeys[path[i]];
            }
            var arrPlaces = Array.from(places.entries());
            for (let i = 0; i < path.length; i++) {
                path[i] = arrValues[path[i]];
            }
		} else {
		    path = [arrValues[0], arrValues[1]];
		    pathStr = arrKeys[0] + " -> " + arrKeys[1];
		}
        this.state = {places: places, path: path, pathStr: pathStr, changed: false, distance: "", duration: ""};
        ymaps.ready(this.init);
	}

	init() {
	    var multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: path,
            params: {
                routingMode: 'pedestrian'
            }
        }, {
            boundsAutoApply: true
        });

        var routeMap = new ymaps.Map('routeMap', {
            center: [59.939099, 30.315877],
            zoom: 12
        });

        var setDistanceAndDuration = this.setDistanceAndDuration;

        function update(distance, duration) {
            setDistanceAndDuration(distance, duration)
        }

        multiRoute.model.events.add('requestsuccess', function() {
            var activeRoute = multiRoute.getActiveRoute();
            var distance = activeRoute.properties.get("distance").text;
            var duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        });

        routeMap.geoObjects.add(multiRoute);
	}

	setDistanceAndDuration(distance, duration) {
        this.setState({distance: distance});
        this.setState({duration: duration});
    }

	render() {
		return(
		<Panel className="panel">
		    <PanelHeader left={<PanelHeaderBack onClick = {(e) => this.go(e, this.state.places)} data-to="mainMap"/>}>
                Маршрут
            </PanelHeader>
            <Group>
                <Div className="basic-container">Длина маршрута: {this.state.distance}</Div>
                <Div className="basic-container">Длительность маршрута: {this.state.duration}</Div>
                <Div className="basic-container">{this.state.pathStr}</Div>
                <Div id="routeMap" className="map-container"></Div>
            </Group>
		</Panel>)
	}
};

export default ResultRoute;