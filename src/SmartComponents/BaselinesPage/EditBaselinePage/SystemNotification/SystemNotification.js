import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Bullseye, Button, Modal, ModalVariant, Spinner } from '@patternfly/react-core';
import NotificationsSystemsTable from '../../../SystemsTable/NotificationsSystemsTable';
import SystemsTable from '../../../SystemsTable/SystemsTable';
import DeleteNotificationModal from './DeleteNotificationModal/DeleteNotificationModal';
import { systemNotificationsActions } from './redux';

export class SystemNotification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpened: false,
            systemsToAdd: []
        };

        this.toggleModal = () => {
            const { setSelectedSystemIds } = this.props;
            const { modalOpened } = this.state;

            setSelectedSystemIds([]);
            this.setState({ modalOpened: !modalOpened });
        };
    }

    buildSystemColumns = (isAddSystemNotifications) => {
        const { permissions } = this.props;
        let columns = [
            { key: 'display_name', props: { width: isAddSystemNotifications ? 20 : null }, title: 'Name' },
            { key: 'tags', props: { width: isAddSystemNotifications ? 10 : null, isStatic: true }, title: 'Tags' },
            { key: 'updated', props: { width: isAddSystemNotifications ? 10 : null }, title: 'Last seen' }
        ];

        if (permissions.notificationsWrite && !isAddSystemNotifications) {
            columns.push({
                key: 'system_notification',
                title: '',
                props: {
                    isStatic: true
                }
            });
        }

        return columns;
    };

    deleteNotifications = async (systemIds) => {
        const { setSystemsToDelete, toggleDeleteNotificationsModal } = this.props;

        toggleDeleteNotificationsModal();
        setSystemsToDelete(systemIds);
    }

    selectSystemsToAdd = (systemIds) => {
        const { systemNotificationIds } = this.props;
        let array = [ ...systemNotificationIds ];

        const newIds = systemIds.filter((newId) => !array.some((existingId) => existingId === newId));

        this.setState({ systemsToAdd: newIds });
    }

    addNotification = async () => {
        const { systemsToAdd } = this.state;
        const { addNotifications, baselineId } = this.props;

        await addNotifications(baselineId, systemsToAdd);
        this.setState({ systemsToAdd: []});

        this.toggleModal();
        this.fetchSystems(baselineId);
    }

    buildNotificationsButton = () => {
        return <Button
            key="add-baseline-notification"
            variant="primary"
            onClick={ this.toggleModal }
            ouiaId="add-baseline-notification-button"
        >
            Add associated system
        </Button>;
    }

    fetchSystems = async (baselineId) => {
        const { fetchBaselineData, getNotifications } = this.props;

        getNotifications(baselineId);
        fetchBaselineData(baselineId);
    }

    async componentDidMount() {
        await this.fetchSystems(this.props.baselineId);
    }

    render() {
        const { baselineId, baselineName, deleteNotifications, deleteNotificationsModalOpened, driftClearFilters, entities,
            permissions, selectEntities, selectHistoricProfiles, setSelectedSystemIds, systemNotificationIds,
            systemsToDelete, toggleDeleteNotificationsModal, systemNotificationLoaded } = this.props;
        const { modalOpened } = this.state;

        return (
            <React.Fragment>
                <DeleteNotificationModal
                    baselineId={ baselineId }
                    deleteNotifications={ deleteNotifications }
                    deleteNotificationsModalOpened={ deleteNotificationsModalOpened }
                    systemsToDelete={ systemsToDelete }
                    toggleDeleteNotificationsModal={ toggleDeleteNotificationsModal }
                    fetchSystems={ this.fetchSystems }
                />
                <Modal
                    className="drift"
                    width='1200px'
                    ouiaId='add-baseline-notification-modal'
                    variant={ ModalVariant.medium }
                    title={ 'Associate system with ' + baselineName }
                    isOpen={ modalOpened }
                    onClose={ this.toggleModal }
                    actions = { [
                        <Button
                            key="confirm"
                            ouiaId='add-baseline-notification-button'
                            variant="primary"
                            onClick={ this.addNotification }
                        >
                            Submit
                        </Button>,
                        <Button
                            key="cancel"
                            ouiaId='add-baseline-notification-cancel-button'
                            variant="link"
                            onClick={ this.toggleModal }
                        >
                            Cancel
                        </Button>
                    ] }
                >
                    <SystemsTable
                        hasMultiSelect={ true }
                        permissions={ permissions }
                        entities={ entities }
                        selectVariant='checkbox'
                        systemNotificationIds={ systemNotificationIds }
                        baselineId={ baselineId }
                        isAddSystemNotifications={ true }
                        driftClearFilters={ driftClearFilters }
                        selectEntities={ selectEntities }
                        selectHistoricProfiles={ selectHistoricProfiles }
                        selectSystemsToAdd={ this.selectSystemsToAdd }
                        selectedSystemIds={ entities?.selectedSystemIds || [] }
                        systemColumns={ this.buildSystemColumns(true) }
                    />
                </Modal>
                { systemNotificationLoaded ? <NotificationsSystemsTable
                    hasMultiSelect={ true }
                    permissions={ permissions }
                    selectVariant='checkbox'
                    systemNotificationIds={ systemNotificationIds }
                    baselineId={ baselineId }
                    toolbarButton={ this.buildNotificationsButton() }
                    driftClearFilters={ driftClearFilters }
                    selectEntities={ selectEntities }
                    selectHistoricProfiles={ selectHistoricProfiles }
                    onSystemSelect={ setSelectedSystemIds }
                    deleteNotifications={ this.deleteNotifications }
                    systemColumns={ this.buildSystemColumns() }
                /> : <Bullseye><Spinner size="xl"/></Bullseye> }
            </React.Fragment>
        );
    }
}

SystemNotification.propTypes = {
    addNotifications: PropTypes.func,
    baselineId: PropTypes.string,
    baselineName: PropTypes.string,
    entities: PropTypes.object,
    fetchBaselineData: PropTypes.func,
    permissions: PropTypes.object,
    selectHistoricProfiles: PropTypes.func,
    setSelectedSystemIds: PropTypes.func,
    driftClearFilters: PropTypes.func,
    selectEntities: PropTypes.func,
    toggleDeleteNotificationsModal: PropTypes.func,
    setSystemsToDelete: PropTypes.func,
    systemsToDelete: PropTypes.array,
    deleteNotifications: PropTypes.func,
    deleteNotificationsModalOpened: PropTypes.bool,
    getNotifications: PropTypes.func,
    setSystemsToAdd: PropTypes.func,
    systemNotificationIds: PropTypes.array,
    systemNotificationLoaded: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        deleteNotificationsModalOpened: state.systemNotificationsState.deleteNotificationsModalOpened,
        systemNotificationIds: state.systemNotificationsState.systemNotificationIds,
        systemNotificationLoaded: state.systemNotificationsState.systemNotificationLoaded,
        systemsToDelete: state.systemNotificationsState.systemsToDelete
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addNotifications: (baselineId, systemsToAdd) => dispatch(systemNotificationsActions.addNotifications(baselineId, systemsToAdd)),
        toggleDeleteNotificationsModal: () => dispatch(systemNotificationsActions.toggleDeleteNotificationsModal()),
        setSystemsToDelete: (systemIds) => dispatch(systemNotificationsActions.setSystemsToDelete(systemIds)),
        deleteNotifications: (baselineId, systemIds) => dispatch(systemNotificationsActions.deleteNotifications(baselineId, systemIds)),
        getNotifications: (baselineId) => dispatch(systemNotificationsActions.getNotifications(baselineId)),
        setSelectedSystemIds: (systemIds) => dispatch({ type: 'SET_SELECTED_SYSTEM_IDS', payload: systemIds })
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemNotification);
