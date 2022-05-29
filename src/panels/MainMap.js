import React from 'react';
import { Panel, PanelHeader, PanelHeaderContent, PanelHeaderContext, List, Group, Div, Button, FormItem, Chip, Alert, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
import './style.css';
import citiesJSON from './cities.json';
import { Icon24ChevronDown } from '@vkontakte/icons';

var placemarksMap = new Map();
var searchMap = null;

var currentPlacemark = null;

var citiesArr = citiesJSON.response.items;
var citiesSet = new Set();
for (let i = 0; i < citiesArr.length; i++) {
    citiesSet.add(citiesArr[i].title);
}

class Places extends React.Component {
    constructor(props) {
        super(props);
        this.places = this.props.places;
        this.removePlace = this.removePlace.bind(this);
    }

    removePlace(e, pointName) {
        this.places.delete(pointName);
        this.props.onChange();
        searchMap.geoObjects.remove(placemarksMap.get(pointName));
        placemarksMap.delete(pointName);
    }

    render() {
        var names = Array.from(this.places.keys());
        if (names.length == 0) {
            return(
                <Div>
                    <FormItem top="Вы еще не выбрали ни одной точки">
                    </FormItem>
                </Div>
            )
        }
        return (
            <Div>
                <FormItem>
                {names.map((pointName) => {
                    return (
                        <Chip key={pointName} onClick={(e) => this.removePlace(e, pointName)}>{pointName}</Chip>
                    )
                })}
                </FormItem>
            </Div>
        )
    }
}

class SearchMap extends React.Component {
    constructor(props) {
        super(props);
        this.places = this.props.places;
        this.addPlace = this.addPlace.bind(this);
        this.removePlace = this.removePlace.bind(this);
        this.init = this.init.bind(this);
        this.openAlert = this.openAlert.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.state = {popout: null};
        ymaps.ready(this.init);
    }

    init() {
        var map = new ymaps.Map('map', {
            center: [59.939099, 30.315877],
            zoom: 12,
            controls: []
        });

        searchMap = map;

        setMapCenter(this.props.city);

        var searchControl = new ymaps.control.SearchControl({
            options: {
                noPlacemark: true
            }
        });

        var searchResults = new ymaps.GeoObjectCollection(null, {
            hasBalloon: false
        });

        map.controls.add(searchControl);
        map.geoObjects.add(searchResults);

        searchResults.events.add('click', (e) => addBySearch(e));
        searchControl.events.add('resultselect', function (e) {
            var index = e.get('index');
            searchControl.getResult(index).then(function (res) {
                if (currentPlacemark != null) {
                    map.geoObjects.remove(currentPlacemark);
                }
                res.properties.set('iconCaption', res.properties._data.name);
                searchResults.add(res);
                map.geoObjects.add(searchResults);
                currentPlacemark = searchResults;
            });
        }).add('submit', function () {
            searchResults.removeAll();
        });

        var placemark;
        var openAlert = this.openAlert;
        var showChosenPoints = this.showChosenPoints;

        function addByClick(e) {
            var point = e.get('target');
            if (point.properties._data.iconCaption != "поиск...") {
                var pointName = point.properties._data.pointName;
                if (pointName != '') {
                    var pointCoords = point.geometry.getCoordinates();
                    openAlert(pointName, pointCoords);
                }
            }
        }

        function addBySearch(e) {
            var point = e.get('target');
            var pointName = point.properties._data.name;
            var pointCoords = point.geometry.getCoordinates();
            openAlert(pointName, pointCoords);
        }

        map.events.add('click', function (e) {
            if (currentPlacemark != null) {
                map.geoObjects.remove(currentPlacemark);
            }
            var coords = e.get('coords');
            placemark = createPlacemark(coords);
            currentPlacemark = placemark;
            map.geoObjects.add(placemark);
            placemark.events.add('dragend', function () {
                getAddress(placemark.geometry.getCoordinates());
            });
            placemark.events.add('click', (e) => addByClick(e));
            getAddress(coords);
        });

        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#blueDotIconWithCaption',
                draggable: true
            });
        }

        function getAddress(coords) {
            placemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                placemark.properties.set({
                    iconCaption: [
                        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise(),
                        firstGeoObject.getPremiseNumber()
                    ].filter(Boolean).join(', '),
                    pointName: [
                        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise(),
                        firstGeoObject.getPremiseNumber()
                    ].filter(Boolean).join(', ')
                });
            });
        }

        var cities = Array.from(citiesSet);
        var citiesList = new Set();
        for (let i = 0; i < cities.length; i++) {
            citiesList.add(new ymaps.control.ListBoxItem(cities[i]));
        }

        var cityList = new ymaps.control.ListBox({
            data: {
                content: this.props.city
            },
            items: Array.from(citiesList)
        });

        var selectedItem = null;

        for (let i = 0; i < cities.length; i++) {
            cityList.get(i).events.add('click', function (e) {
                cityList.collapse();
                cityList.data.set('content', cities[i]);
                if (selectedItem != null) {
                    selectedItem.deselect();
                }
                selectedItem = e.get('target');
                setMapCenter(cities[i]);
            });
        }

        map.controls.add(cityList, {float: 'right'});

        function setMapCenter(city) {
            var geocoder = ymaps.geocode(city);
            geocoder.then(
                function (res) {
                    var coords = res.geoObjects.get(0).geometry._coordinates;
                    map.setCenter(coords);
                },
                function (err) {
                }
            );
        }

        if (this.places.size > 0) {
            for (let pointName of this.props.places.keys()) {
                var pointCoords = this.props.places.get(pointName);
                var addedPlacemark = new ymaps.Placemark(pointCoords, {
                    iconCaption: pointName
                }, {
                    preset: 'islands#redDotIconWithCaption'
                })
                searchMap.geoObjects.add(addedPlacemark);
                placemarksMap.set(pointName, addedPlacemark);
                addedPlacemark.events.add('click', () => this.openAlert(pointName, pointCoords));
            }
        }
    };

    addPlace(pointName, pointCoords) {
        this.places.set(pointName, pointCoords);
        this.props.onChange();
        if (currentPlacemark != null) {
            searchMap.geoObjects.remove(currentPlacemark);
            currentPlacemark = null;
        }
        var addedPlacemark = new ymaps.Placemark(pointCoords, {
            iconCaption: pointName
        }, {
            preset: 'islands#redDotIconWithCaption'
        })
        searchMap.geoObjects.add(addedPlacemark);
        placemarksMap.set(pointName, addedPlacemark);
        addedPlacemark.events.add('click', () => this.openAlert(pointName, pointCoords));
    }

    removePlace(pointName) {
        console.log(currentPlacemark);
        this.places.delete(pointName);
        this.props.onChange();
        searchMap.geoObjects.remove(placemarksMap.get(pointName));
        placemarksMap.delete(pointName);
    }

    openAlert(pointName, pointCoords) {
        if (this.places.has(pointName)) {
            this.setState({
                popout: (
                    <Alert actions={[
                        {
                            title: "Отмена",
                            autoclose: true,
                            mode: "cancel",
                        },
                        {
                            title: "Удалить",
                            autoclose: true,
                            mode: "default",
                            action: () => this.removePlace(pointName),
                        },
                    ]}
                    actionsLayout="horizontal"
                    onClose={this.closeAlert}
                    header="Удалить точку"
                    text={pointName}
                    />
                ),
            });
        } else {
            this.setState({
                popout: (
                    <Alert actions={[
                        {
                            title: "Отмена",
                            autoclose: true,
                            mode: "cancel",
                        },
                        {
                            title: "Добавить",
                            autoclose: true,
                            mode: "default",
                            action: () => this.addPlace(pointName, pointCoords),
                        },
                    ]}
                    actionsLayout="horizontal"
                    onClose={this.closeAlert}
                    header="Добавить точку"
                    text={pointName}
                    />
                ),
            });
        }
    }

    closeAlert() {
        this.setState({popout: null});
    }

    render() {
        return (
            <div className="mapDiv">
                <SplitLayout popout={this.state.popout} className="splitLayout">
                    <SplitCol className="splitCol">
                        <div id="map" className="map-container">
                        </div>
                    </SplitCol>
                </SplitLayout>
            </div>
        )
    }
}

class MainMap extends React.Component {
	constructor(props) {
		super(props);
		this.go = this.props.go;
		this.clearPlaces = this.clearPlaces.bind(this);
		if (this.props.places.size > 0) {
		    if (this.props.places.size > 1) {
		        this.state = {places: this.props.places, changed: false, btnDisabled: false, btnVisibility: "visible", contextOpened: false};
		    } else {
		        this.state = {places: this.props.places, changed: false, btnDisabled: true, btnVisibility: "visible", contextOpened: false};
		    }
		} else {
		    this.state = {places: this.props.places, changed: false, btnDisabled: true, btnVisibility: "hidden", contextOpened: false};
		}
		this.toggleContext = this.toggleContext.bind(this);
	}

	onChange = () => {
        if (this.state.places.size > 0) {
            this.setState({btnVisibility: "visible"});
            if (this.state.places.size > 1) {
                this.setState({btnDisabled: false});
            } else {
                this.setState({btnDisabled: true});
            }
        } else {
            this.setState({btnVisibility: "hidden"});
            this.setState({btnDisabled: true});
        }
        this.setState({changed: true});
    }

    clearPlaces() {
        this.state.places.clear();
        searchMap.geoObjects.removeAll();
        placemarksMap.clear();
        currentPlacemark = null;
        this.onChange();
    }

    toggleContext() {
        this.setState({ contextOpened: !this.state.contextOpened });
    }

	render() {
		return (
            <Panel className="panel" id="mainPanel">
                <PanelHeader id="panelHeader">
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
                        Выберите точки
                    </PanelHeaderContent>
                </PanelHeader>
                <PanelHeaderContext opened={this.state.contextOpened} onClose={this.toggleContext}>
                    <List>
                        <Places places={this.state.places} onChange={this.onChange} />
                    </List>
                </PanelHeaderContext>
                <div className="mainGroup">
                    <div className="topPanel">
                    <Div>
                        <Button size="s" mode="secondary" className="btn" onClick={(e) => this.go(e, this.state.places)} data-to="resultRoute" disabled={this.state.btnDisabled}>Построить маршрут</Button>
                        <Button size="s" mode="secondary" className="btn" onClick={this.clearPlaces} style={{visibility: this.state.btnVisibility}}>Сбросить</Button>
                    </Div>
                    </div>
                    <div className="mainMap">
                        <SearchMap className="yandexMap" places={this.state.places} onChange={this.onChange} city={this.props.city} />
                    </div>
                </div>
            </Panel>
        )
	}
};

export default MainMap;