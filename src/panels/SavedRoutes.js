import React from 'react';
import {Panel, PanelHeader, PanelHeaderBack, Div, SimpleCell, Chip} from '@vkontakte/vkui';
import './style.css';
import bridge from "@vkontakte/vk-bridge";

let userRoutes;

const STORAGE_KEYS = {
    ROUTES: 'userRoutes',
}

class RouteList extends React.Component {
    constructor(props) {
        super(props);
        this.routes = this.props.routes;
    }

    render() {
        if (this.routes.size === 0) {
            return (
                <Div>
                    <p>Вы не сохранили ни одного маршрута</p>
                </Div>
            )
        } else {
            return (
                <Div>
                    {this.routes.map((route) => {
                        return (
                            <SimpleCell key={route['name']}>{route['name']}</SimpleCell>
                        )
                    })}
                </Div>
            )
        }
    }
}

class SavedRoutes extends React.Component {
    constructor(props) {
        super(props);
        this.go = this.props.go;
        this.state = {routes: [], isLoaded: false}
    }

    componentDidMount() {
        bridge
            .send('VKWebAppStorageGet', {
                keys: Object.values(STORAGE_KEYS)
            })
            .then(storageData => {
                this.setState({
                    isLoaded: true,
                    routes: JSON.parse(storageData.keys[0].value)['routes']
                });
            })
            .catch(() => {
            });
    }

    render() {
        if (this.state.isLoaded) {
            return (
                <Panel className="panel">
                    <PanelHeader left={<PanelHeaderBack onClick = {(e) => this.go(e, new Map())} data-to="home"/>}>
                        Сохранённые маршруты
                    </PanelHeader>
                    <RouteList routes={this.state.routes}></RouteList>
                </Panel>
            )
        }
        return (
            <Panel className="panel">
                <PanelHeader left={<PanelHeaderBack onClick = {(e) => this.go(e, new Map())} data-to="home"/>}>
                    Сохранённые маршруты
                </PanelHeader>
            </Panel>
        )
    }
}

export default SavedRoutes;