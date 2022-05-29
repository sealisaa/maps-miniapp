import React from 'react';
import { Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, PanelHeaderContext, List, Div } from '@vkontakte/vkui';
import { Icon24ChevronDown } from '@vkontakte/icons';
import './style.css';

let distances = [];
let arrKeys;
let arrValues;
let path = [];
let pathLength;
let sumPathLength = 0;
let visited = [];
let currentPath = [];
let currentPathLength;

function GreedyAlgorithmStart() {
    /*if(задана первая точка) {
        for (let j = 0; j < distances.length; j++) {
			visited[j] = false;
		}
        visited[start] = true;
		currentPath = [start];
		currentPathLength = 0;
        GreedyAlgorithm(start);
    }*/
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
    let currentMinDistance = sumPathLength;
    let currentMinEdge = -1;
    for (let j = 0; j < distances[i].length; j++) {
		if (distances[i][j] !== -1 && !visited[j] && distances[i][j] < currentMinDistance) {
			currentMinDistance = distances[i][j];
			currentMinEdge = j;
		}
	}
	if (currentMinEdge !== -1) {
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

function getDistances() {
    for (let i = 0; i < arrKeys.length; i++) {
        distances[i] = [];
        for (let j = 0; j < arrKeys.length; j++) {
            distances[i][j] = -1;
        }
    }
    for (let i = 0; i < arrKeys.length; i++) {
        for (let j = i + 1; j < arrKeys.length; j++) {
            distances[i][j] = ymaps.coordSystem.geo.getDistance(arrValues[i], arrValues[j]);
            distances[j][i] = distances[i][j];
            sumPathLength += distances[i][j];
        }
    }
}

const Points = ({ points }) => {
    const ABC = "ABCDEFGHIJKLMNOPQRSTUVQXYZ";
    let i = 0;
    return (
        <Div className="Div-padding">
            {points.map((point) => {
                if (i === 0) {
                    return (
                        <div className="flex-container">
                            <div className="letter" style={{background: "#FF485A"}}>{ABC[i++]}</div>
                            <p>{point}</p>
                        </div>
                    )
                }
                if (i === 27) {
                    i = 0;
                }
                if (i === points.length - 1) {
                    return (
                        <div className="flex-container">
                            <div className="letter" style={{background: "#008cff"}}>{ABC[i++]}</div>
                            <p>{point}</p>
                        </div>
                    )
                }
                return (
                    <div className="flex-container">
                        <div className="letter" style={{background: "#42bd42"}}>{ABC[i++]}</div>
                        <p>{point}</p>
                    </div>
                )
            })}
        </Div>
    );
}

class ResultRoute extends React.Component {
	constructor(props) {
		let pathStr;
        super(props);
		this.init = this.init.bind(this);
		this.setDistanceAndDuration = this.setDistanceAndDuration.bind(this);
		this.go = this.props.go;
        let places = this.props.places;
        arrKeys = Array.from(places.keys());
        arrValues = Array.from(places.values());
		if (places.size > 2) {
		    getDistances(places);
            pathLength = sumPathLength;
            GreedyAlgorithmStart();
            for (let i = 0; i < path.length; i++) {
                path[i] = arrValues[path[i]];
            }
		} else {
		    path = [arrValues[0], arrValues[1]];
		}
        pathStr = arrKeys;
        this.state = {places: places, path: path, pathStr: pathStr, changed: false, distance: "", duration: "", contextOpened: true};
        this.toggleContext = this.toggleContext.bind(this);
        ymaps.ready(this.init);
	}

	toggleContext() {
        this.setState({ contextOpened: !this.state.contextOpened });
    }

	init() {
        let routeMap = new ymaps.Map('routeMap', {
            center: [59.939099, 30.315877],
            zoom: 12,
            controls: []
        }, {
            buttonMaxWidth: 300
        });

        let multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: path,
            params: {
                routingMode: 'auto'
            }
        }, {
            boundsAutoApply: true
        });

        routeMap.geoObjects.add(multiRoute);

        let routeTypeSelector = new ymaps.control.ListBox({
            data: {
                content: 'Как добраться'
            },
            items: [
                new ymaps.control.ListBoxItem({data: {content: "Авто"}, state: {selected: true}}),
                new ymaps.control.ListBoxItem({data: {content: "Общественным транспортом"}}),
                new ymaps.control.ListBoxItem({data: {content: "Пешком"}})
            ],
            options: {
                itemSelectOnClick: false
            }
        });

        routeMap.controls.add(routeTypeSelector);

        let autoRouteItem = routeTypeSelector.get(0);
        let masstransitRouteItem = routeTypeSelector.get(1);
        let pedestrianRouteItem = routeTypeSelector.get(2);

        autoRouteItem.events.add('click', function (e) { changeRoutingMode('auto', e.get('target')); });
        masstransitRouteItem.events.add('click', function (e) { changeRoutingMode('masstransit', e.get('target')); });
        pedestrianRouteItem.events.add('click', function (e) { changeRoutingMode('pedestrian', e.get('target')); });

        function changeRoutingMode(routingMode, targetItem) {
            multiRoute.model.setParams({ routingMode: routingMode });
            autoRouteItem.deselect();
            masstransitRouteItem.deselect();
            pedestrianRouteItem.deselect();
            targetItem.select();
            routeTypeSelector.collapse();
            let activeRoute = multiRoute.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        }

        let setDistanceAndDuration = this.setDistanceAndDuration;

        function update(distance, duration) {
            setDistanceAndDuration(distance, duration)
        }

        multiRoute.model.events.add('requestsuccess', function() {
            let activeRoute = multiRoute.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        });

        multiRoute.events.add('activeroutechange', function() {
            console.log("active route changed");
            let activeRoute = multiRoute.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        });
	}

	setDistanceAndDuration(distance, duration) {
        this.setState({distance: distance});
        this.setState({duration: duration});
    }

	render() {
		return(
		<Panel className="panel">
		    <PanelHeader left={<PanelHeaderBack onClick = {(e) => this.go(e, this.state.places)} data-to="mainMap"/>}>
		        <PanelHeaderContent
		            aside={
		                <Icon24ChevronDown
		                    style={{
		                        transform: `rotate(${
		                        this.state.contextOpened ? "180deg" : "0"
		                        })`,
		                        margin: "10px",
		                    }}
                        />
                    }
                    onClick={this.toggleContext}>
                    Детали маршрута
                </PanelHeaderContent>
            </PanelHeader>
            <PanelHeaderContext opened={this.state.contextOpened} onClose={this.toggleContext}>
                <List>
                    <Points points={this.state.pathStr}></Points>
                    <Div>
                        <div className="flex-container">
                            <p className="black"><b>{this.state.duration}</b></p>
                            <p className="grey"><b>{this.state.distance}</b></p>
                        </div>
                    </Div>
                </List>
              </PanelHeaderContext>
            <div className="mainGroup">
                <div id="routeMap" className="map-container"></div>
            </div>
		</Panel>)
	}
}

export default ResultRoute;