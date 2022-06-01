import React from 'react';
import {Panel, PanelHeader, PanelHeaderBack, Div, SimpleCell, Chip} from '@vkontakte/vkui';
import './style.css';
import bridge from "@vkontakte/vk-bridge";

const STORAGE_KEYS = {
    ROUTES: 'userRoutes',
}

class RouteList extends React.Component {
    constructor(props) {
        super(props);
        this.routes = this.props.routes;
        this.showSavedRoute = this.props.showSavedRoute;
    }

    render() {
        if (this.routes.length === 0) {
            return (
                <Div className="grey">Вы не сохранили ни одного маршрута</Div>
            )
        } else {
            return (
                <Div>
                    {this.routes.map((route) => {
                        return (
                            <SimpleCell onClick={(e) => this.showSavedRoute(e, route)} data-to={"route"} key={route['name']}>{route['name']}</SimpleCell>
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
                    <RouteList routes={this.state.routes} showSavedRoute={this.props.showSavedRoute}></RouteList>
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