import React from 'react';
import { Panel } from '@vkontakte/vkui';
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
    arrKeys = Array.from(places.keys());
    arrValues = Array.from(places.values());
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
		var places = this.props.places;
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
        this.state = {path: path, pathStr: pathStr, changed: false};
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

        routeMap.geoObjects.add(multiRoute);
	}

	render() {
		return(
		<Panel className="panel">
		    <div className="basic-container">{this.state.pathStr}</div>
		    <div id="routeMap" className="map-container"></div>
		</Panel>)
	}
};

export default ResultRoute;