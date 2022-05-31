import React from 'react';
import { Div, List, Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, PanelHeaderContext, Avatar } from '@vkontakte/vkui';
import { Icon24ChevronDown, Icon28Favorite } from '@vkontakte/icons';
import { Icon28FavoriteOutline } from '@vkontakte/icons';
import './style.css';
import bridge from "@vkontakte/vk-bridge";

let distances = [];
let arrNames;
let arrCoords;
let path = [];
let pathStr = [];
let pathLength;
let sumPathLength = 0;
let visited = [];
let currentPath = [];
let currentPathLength;
let places;
let routeMap = null;
let route = null;
let userRoutes = [];

const STORAGE_KEYS = {
    ROUTES: 'userRoutes',
}

function GreedyAlgorithmStart(startPoint) {
	for (let i = 0; i < distances.length; i++) {
        if (startPoint != null && arrNames[i] !== startPoint) {
            continue;
        }
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
        if (startPoint != null) {
            return;
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
    distances = [];
    for (let i = 0; i < arrNames.length; i++) {
        distances[i] = [];
        for (let j = 0; j < arrNames.length; j++) {
            distances[i][j] = -1;
        }
    }
    for (let i = 0; i < arrNames.length; i++) {
        for (let j = i + 1; j < arrNames.length; j++) {
            distances[i][j] = ymaps.coordSystem.geo.getDistance(arrCoords[i], arrCoords[j]);
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
                        <div key={point} className="flex-container">
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
                        <div key={point} className="flex-container">
                            <div className="letter" style={{background: "#008cff"}}>{ABC[i++]}</div>
                            <p>{point}</p>
                        </div>
                    )
                }
                return (
                    <div key={point} className="flex-container">
                        <div className="letter" style={{background: "#42bd42"}}>{ABC[i++]}</div >
                        <p>{point}</p>
                    </div>
                )
            })}
        </Div>
    );
}

class Route extends React.Component {
	constructor(props) {
        super(props);
		this.init = this.init.bind(this);
		this.setDistanceAndDuration = this.setDistanceAndDuration.bind(this);
        this.buildRoute = this.buildRoute.bind(this);
        this.saveRoute = this.saveRoute.bind(this);
        this.deleteRoute = this.deleteRoute.bind(this);
        this.toggleContext = this.toggleContext.bind(this);
        this.getUserRoutes = this.getUserRoutes.bind(this);
        this.getUserRoutes();
		this.go = this.props.go;
        places = this.props.places;
        arrNames = Array.from(places.keys());
        arrCoords = Array.from(places.values());
        if (places.size > 2) {
            getDistances(places);
            pathLength = sumPathLength;
            GreedyAlgorithmStart(null);
            for (let i = 0; i < path.length; i++) {
                pathStr[i] = arrNames[path[i]];
                path[i] = arrCoords[path[i]];
            }
        } else {
            path = arrCoords;
            pathStr = arrNames;
        }
        this.state = {places: places, path: path, pathStr: pathStr, changed: false, distance: "", duration: "", contextOpened: false, saved: false, saveBtnVisibility: "visible", deleteBtnVisibility: "hidden"};
        ymaps.ready(this.init);
	}

    getUserRoutes() {
        async function fetchData() {
            const storageData = await bridge.send('VKWebAppStorageGet', {
                keys: Object.values(STORAGE_KEYS)
            });
            userRoutes = JSON.parse(storageData.keys[0].value);
        }
        fetchData();
    }

	toggleContext() {
        this.setState({ contextOpened: !this.state.contextOpened });
    }

	init() {
        routeMap = new ymaps.Map('routeMap', {
            center: [59.939099, 30.315877],
            zoom: 12,
            controls: []
        }, {
            buttonMaxWidth: 300
        });

        route = new ymaps.multiRouter.MultiRoute({
            referencePoints: path,
            params: {
                routingMode: 'auto'
            }
        }, {
            boundsAutoApply: true
        });

        routeMap.geoObjects.add(route);

        let routeTypeSelector = new ymaps.control.ListBox({
            data: {
                content: 'Как добраться'
            },
            items: [
                new ymaps.control.ListBoxItem({data: {content: "На автомобиле"}, state: {selected: true}}),
                new ymaps.control.ListBoxItem({data: {content: "Общественным транспортом"}}),
                new ymaps.control.ListBoxItem({data: {content: "Пешком"}})
            ],
            options: {
                itemSelectOnClick: false
            }
        });

        let pointsSet = new Set();
        let pointNamesSet = new Set();
        pointsSet.add(new ymaps.control.ListBoxItem("Мое местоположение"));
        pointNamesSet.add("Мое местоположение");
        for (let i = 0; i < arrNames.length; i++) {
            pointsSet.add(new ymaps.control.ListBoxItem(arrNames[i]));
            pointNamesSet.add(arrNames[i]);
        }
        let pointsArr = Array.from(pointsSet);
        let pointNamesArr = Array.from(pointNamesSet);

        let startPointSelector = new ymaps.control.ListBox({
            data: {
                content: 'Начальная точка'
            },
            items: pointsArr
        });

        let selectedPoint = null;

        for (let i = 0; i < pointsArr.length; i++) {
            let point = startPointSelector.get(i);
            point.events.add('click', function (e) {
                startPointSelector.collapse();
                if (selectedPoint != null) {
                    selectedPoint.deselect();
                }
                selectedPoint = e.get('target');
                changeStartPoint(pointNamesArr[i]);
            });
        }

        let geolocation = ymaps.geolocation;
        let buildRoute = this.buildRoute;

        function changeStartPoint(startPoint) {
            if (startPoint === "Мое местоположение") {
                getGeolocation();
            } else {
                places.delete("Вы здесь");
                buildRoute(startPoint);
            }
        }

        function getGeolocation() {
            geolocation.get({
                provider: 'yandex',
                mapStateAutoApply: true
            }).then(function (result) {
                places.set("Вы здесь", result.geoObjects.get(0).geometry._coordinates);
                buildRoute("Вы здесь");
            });
        }

        routeMap.controls.add(startPointSelector);
        routeMap.controls.add(routeTypeSelector);

        let autoRouteItem = routeTypeSelector.get(0);
        let masstransitRouteItem = routeTypeSelector.get(1);
        let pedestrianRouteItem = routeTypeSelector.get(2);

        autoRouteItem.events.add('click', function (e) { changeRoutingMode('auto', e.get('target')); });
        masstransitRouteItem.events.add('click', function (e) { changeRoutingMode('masstransit', e.get('target')); });
        pedestrianRouteItem.events.add('click', function (e) { changeRoutingMode('pedestrian', e.get('target')); });

        function changeRoutingMode(routingMode, targetItem) {
            route.model.setParams({ routingMode: routingMode });
            autoRouteItem.deselect();
            masstransitRouteItem.deselect();
            pedestrianRouteItem.deselect();
            targetItem.select();
            routeTypeSelector.collapse();
            let activeRoute = route.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        }

        let setDistanceAndDuration = this.setDistanceAndDuration;

        function update(distance, duration) {
            setDistanceAndDuration(distance, duration)
        }

        route.model.events.add('requestsuccess', function() {
            let activeRoute = route.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        });

        route.events.add('activeroutechange', function() {
            let activeRoute = route.getActiveRoute();
            let distance = activeRoute.properties.get("distance").text;
            let duration = activeRoute.properties.get("duration").text;
            update(distance, duration);
        });
	}

    buildRoute(startPoint) {
        if (startPoint === this.state.startPoint) {
            return;
        }
        arrNames = Array.from(places.keys());
        arrCoords = Array.from(places.values());
        if (places.size > 2) {
            getDistances(places);
            pathLength = sumPathLength;
            GreedyAlgorithmStart(startPoint);
            pathStr = [];
            for (let i = 0; i < path.length; i++) {
                pathStr[i] = arrNames[path[i]];
                path[i] = arrCoords[path[i]];
            }
        } else {
            if (startPoint === pathStr[0]) {
                path = arrCoords;
                pathStr = arrNames;
            } else {
                path = [arrCoords[1], arrCoords[0]];
                pathStr = [arrNames[1], arrNames[0]];
            }
        }
        this.setState({places: places, path: path, pathStr: pathStr, startPoint: startPoint});
        route.model.setReferencePoints(path);
    }

	setDistanceAndDuration(distance, duration) {
        this.setState({distance: distance, duration: duration});
    }

    saveRoute() {
        async function sendData() {
            await bridge.send('VKWebAppStorageSet', {
                key: 'userRoutes',
                value: JSON.stringify(userRoutes)
            });
        }
        userRoutes['routes'].push({
            "name": "имя маршрута",
            "points": path
        });
        sendData();
        this.setState({saveBtnVisibility: "hidden", deleteBtnVisibility: "visible"});
    }

    deleteRoute() {
        async function sendData() {
            await bridge.send('VKWebAppStorageSet', {
                key: 'userRoutes',
                value: JSON.stringify(userRoutes)
            });
        }
        userRoutes['routes'].pop();
        sendData();
        this.setState({saveBtnVisibility: "visible", deleteBtnVisibility: "hidden"});
    }

	render() {
		return(
		<Panel className="panel">
		    <PanelHeader left={<PanelHeaderBack onClick = {(e) => this.go(e, this.state.places)} data-to="home"/>}>
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
                <Avatar onClick={this.saveRoute} id="saveBtn" style={{ background: 'var(--background_content)', visibility: this.state.saveBtnVisibility }} size={32} shadow={false}><Icon28FavoriteOutline /></Avatar>
                <Avatar onClick={this.deleteRoute} id="deleteBtn" style={{ background: 'var(--background_content)', visibility: this.state.deleteBtnVisibility }}  size={32} shadow={false}><Icon28Favorite fill="#ffdb4d" /></Avatar>
            </div>
		</Panel>)
	}
}

export default Route;