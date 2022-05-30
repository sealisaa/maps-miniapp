import React from 'react';
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import './style.css';

class SavedRoutes extends React.Component {
    constructor(props) {
        super(props);
        this.go = this.props.go;
    }
    render() {
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