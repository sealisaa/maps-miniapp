import React from 'react';
import { Panel, PanelHeader, Group, Div, Button, FormItem, Chip, Alert, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
import './style.css';
import citiesJSON from './cities.json';

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

    removePlace(e, place) {
        this.places.delete(place);
        this.props.onChange();
    }

    render() {
        var names = Array.from(this.places.keys());
        if (names.length == 0) {
            return(
                <Div>
                    <FormItem>
                    </FormItem>
                </Div>
            )
        }
        return (
            <Div>
                <FormItem>
                {names.map((place) => {
                    return (
                        <Chip key={place} onClick={(e) => this.removePlace(e, place)}>{place}</Chip>
                    )
                })}
                </FormItem>
            </Div>
        )
    }
}

class YandexMap extends React.Component {
    constructor(props) {
        super(props);
        this.places = this.props.places;
        this.addPlace = this.addPlace.bind(this);
        this.removePlace = this.removePlace.bind(this);
        this.init = this.init.bind(this);
        this.openAlert = this.openAlert.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.state = {popout: null, openAlert: this.openAlert};
        ymaps.ready(this.init);
    }

    init() {
        var mapContainer = document.getElementById('map');
        var topPanel = document.getElementById('topPanel');
        var panelHeader = document.getElementById('panelHeader');
        var mainGroup = document.getElementById('mainGroup');
        console.log(mainGroup.offsetHeight);
        if (mainGroup.offsetHeight > 500) {
            mapContainer.style.height = mainGroup.offsetHeight - topPanel.offsetHeight + 16 + 'px';
        } else {
            mapContainer.style.height = mainGroup.offsetHeight - panelHeader.offsetHeight - topPanel.offsetHeight + 16 + 'px';
        }

        var map = new ymaps.Map('map', {
            center: [59.939099, 30.315877],
            zoom: 12,
            controls: []
        });

        setCityCoords(this.props.city);

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

        searchResults.events.add('click', (e) => addBySearch(e));
        searchControl.events.add('resultselect', function (e) {
            var index = e.get('index');
            searchControl.getResult(index).then(function (res) {
                map.geoObjects.removeAll();
                searchResults.add(res);
                map.geoObjects.add(searchResults);
            });
        }).add('submit', function () {
            searchResults.removeAll();
        });

        var placemark;
        var openAlert = this.openAlert;

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
            map.geoObjects.removeAll();
            var coords = e.get('coords');
            placemark = createPlacemark(coords);
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
                setCityCoords(cities[i]);
            });
        }

        map.controls.add(cityList, {float: 'right'});

        function setCityCoords(city) {
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
    };

    addPlace(pointName, pointCoords) {
        this.places.set(pointName, pointCoords);
        this.props.onChange();
    }

    removePlace(pointName) {
        this.places.delete(pointName);
        this.props.onChange();
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
            <SplitLayout popout={this.state.popout}>
                <SplitCol>
                    <div id="map" className="map-container"></div>
                </SplitCol>
            </SplitLayout>
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
		        this.state = {places: this.props.places, changed: false, btnDisabled: false, btnVisibility: "visible"};
		    } else {
		        this.state = {places: this.props.places, changed: false, btnDisabled: true, btnVisibility: "visible"};
		    }
		} else {
		    this.state = {places: this.props.places, changed: false, btnDisabled: true, btnVisibility: "hidden"};
		}
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
        this.onChange();
    }

	render() {
		return (
            <Panel className="panel" id="mainPanel">
                <PanelHeader id="panelHeader">Выберите точки</PanelHeader>
                <Group id="mainGroup">
                    <div id="topPanel">
                    <Places places={this.state.places} onChange={this.onChange} />
                    <Div>
                        <Button size="s" mode="secondary" className="btn" onClick={(e) => this.go(e, this.state.places)} data-to="resultRoute" disabled={this.state.btnDisabled}>Построить маршрут</Button>
                        <Button size="s" mode="secondary" className="btn" onClick={this.clearPlaces} style={{visibility: this.state.btnVisibility}}>Сбросить</Button>
                    </Div>
                    </div>
                    <YandexMap places={this.state.places} onChange={this.onChange} city={this.props.city} />
                </Group>
            </Panel>
        )
	}
};

export default MainMap;