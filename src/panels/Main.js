import React from 'react';
import { Panel, PanelHeader, Group, Div, Button, FormItem, Chip, Alert, SplitLayout, SplitCol, View, HorizontalScroll } from '@vkontakte/vkui';
import './style.css';

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
                    <FormItem top="Добавляйте точки для маршрута нажатием на метки">
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
		console.log(this.props.places.size);
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
            <Panel className="panel">
                <PanelHeader>
                    Выберите точки
                </PanelHeader>
                <Group>
                    <Places places={this.state.places} onChange={this.onChange} />
                    <Div>
                        <Button size="s" mode="secondary" className="btn" onClick={(e) => this.go(e, this.state.places)} data-to="resultRoute" disabled={this.state.btnDisabled}>Построить маршрут</Button>
                        <Button size="s" mode="secondary" className="btn" onClick={this.clearPlaces} style={{visibility: this.state.btnVisibility}}>Сбросить</Button>
                    </Div>
                    <Div><YandexMap places={this.state.places} onChange={this.onChange} /></Div>
                </Group>
            </Panel>
        )
	}
};

export default MainMap;