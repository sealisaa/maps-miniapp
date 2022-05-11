import React from 'react';
import { Panel, Button, FormItem, Chip, Alert, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
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
            return(<div></div>)
        }
        return (
            <FormItem top="Выбранные точки">
            {names.map((place) => {
                return (
                    <Chip key={place} onClick={(e) => this.removePlace(e, place)}>{place}</Chip>
                )
            })}
            </FormItem>
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
        this.state = {popout: null};
        this.openAlert = this.openAlert.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
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

        searchResults.events.add('click', (e) => this.openAlert(e));
        searchControl.events.add('resultselect', function (e, places) {
            var index = e.get('index');
            searchControl.getResult(index).then(function (res) {
                searchResults.add(res);
            });
        }).add('submit', function () {
                searchResults.removeAll();
        });
    };

    addPlace(pointName, pointCoords) {
        console.log("add");
        this.places.set(pointName, pointCoords);
        this.props.onChange();
    }

    removePlace(pointName) {
        console.log("delete");
        this.places.delete(pointName);
        this.props.onChange();
    }

    openAlert(e) {
        var point = e.get('target');
        var pointName = point.properties._data.name;
        var pointCoords = e.get('target').geometry.getCoordinates();
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
            <SplitLayout className="panel" popout={this.state.popout}>
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
		this.state = {places: new Map(), changed: false};
		this.go = this.props.go;
	}

	onChange = () => {
      this.setState({changed: true});
    }

	render() {
		return (
            <Panel className="panel">
                <Places places={this.state.places} onChange={this.onChange} />
                <Button size="s" mode="secondary" className="btn" onClick = {(e) => this.go(e, this.state.places)} data-to="resultRoute">Построить маршрут</Button>
                <YandexMap places={this.state.places} onChange={this.onChange} />
            </Panel>
        )
	}
};

export default MainMap;