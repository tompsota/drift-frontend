import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import toJson from 'enzyme-to-json';
import baselinesTableFixtures from '../../BaselinesTable/redux/__tests__/baselinesTableReducer.fixtures';
import _ from 'lodash';

import ConnectedBaselinesPage, { BaselinesPage } from '../BaselinesPage';

describe('BaselinesPage', () => {
    let props;

    beforeEach(() => {
        props = {
            loading: false,
            emptyState: false,
            baselineError: {},
            clearEditBaselineData: jest.fn()
        };
    });

    it('should render correctly', () => {
        const wrapper = shallow(
            <BaselinesPage { ...props }/>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render error', () => {
        props.loading = true;
        props.baselineError = { detail: 'error', status: 404 };
        const wrapper = shallow(
            <BaselinesPage { ...props } />
        );
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should call onSelect with isSelected true', () => {
        props.baselineTableData = [
            [ '1234', 'baseline 1', '1 month ago' ],
            [ '5678', 'baseline 2', '2 months ago' ]
        ];
        const selectBaseline = jest.fn();
        const wrapper = shallow(
            <BaselinesPage
                { ...props }
                selectBaseline={ selectBaseline }
            />
        );

        wrapper.instance().onSelect(_, true, 0);
        expect(selectBaseline).toHaveBeenCalledWith([ '1234' ], true, 'CHECKBOX');
    });

    it('should call onSelect with isSelected false', () => {
        props.baselineTableData = [
            [ '1234', 'baseline 1', '1 month ago' ],
            [ '5678', 'baseline 2', '2 months ago' ]
        ];
        const selectBaseline = jest.fn();
        const wrapper = shallow(
            <BaselinesPage
                { ...props }
                selectBaseline={ selectBaseline }
            />
        );

        wrapper.instance().onSelect(_, false, 0);
        expect(selectBaseline).toHaveBeenCalledWith([ '1234' ], false, 'CHECKBOX');
    });

    it('should call onSelect and select all', () => {
        props.baselineTableData = [
            [ '1234', 'baseline 1', '1 month ago' ],
            [ '5678', 'baseline 2', '2 months ago' ]
        ];
        const selectBaseline = jest.fn();
        const wrapper = shallow(
            <BaselinesPage
                { ...props }
                selectBaseline={ selectBaseline }
            />
        );

        wrapper.instance().onSelect(_, true, -1);
        expect(selectBaseline).toHaveBeenCalledWith([ '1234', '5678' ], true, 'CHECKBOX');
    });

    it('should call onBulkSelect with isSelected true', () => {
        props.baselineTableData = [
            [ '1234', 'baseline 1', '1 month ago' ],
            [ '5678', 'baseline 2', '2 months ago' ]
        ];
        const selectBaseline = jest.fn();
        const wrapper = shallow(
            <BaselinesPage
                { ...props }
                selectBaseline={ selectBaseline }
            />
        );

        wrapper.instance().onBulkSelect(true);
        expect(selectBaseline).toHaveBeenCalledWith([ '1234', '5678' ], true, 'CHECKBOX');
    });

    it('should call onBulkSelect with isSelected false', () => {
        props.baselineTableData = [
            [ '1234', 'baseline 1', '1 month ago' ],
            [ '5678', 'baseline 2', '2 months ago' ]
        ];
        const selectBaseline = jest.fn();
        const wrapper = shallow(
            <BaselinesPage
                { ...props }
                selectBaseline={ selectBaseline }
            />
        );

        wrapper.instance().onBulkSelect(false);
        expect(selectBaseline).toHaveBeenCalledWith([ '1234', '5678' ], false, 'CHECKBOX');
    });
});

describe('ConnectedBaselinesPage', () => {
    let initialState;
    let mockStore;

    beforeEach(() => {
        mockStore = configureStore();

        initialState = {
            baselinesTableState: {
                checkboxTable: {
                    loading: false,
                    emptyState: false,
                    baselineTableData: [],
                    selectedBaselineIds: [],
                    baselineError: {}
                },
                radioTable: {
                    loading: false,
                    emptyState: false,
                    selectedBaselineIds: [],
                    baselineError: {}
                }
            },
            createBaselineModalState: {
                createBaselineModalOpened: false,
                error: {}
            },
            addSystemModalState: {
                addSystemModalOpened: false
            },
            compareState: {
                fullCompareData: []
            },
            historicProfilesState: {
                selectedHSPIds: []
            }
        };
    });

    it('should render correctly', () => {
        const store = mockStore(initialState);
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesPage />
                </Provider>
            </MemoryRouter>
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render empty state', () => {
        initialState.baselinesTableState.checkboxTable.emptyState = true;
        const store = mockStore(initialState);
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesPage />
                </Provider>
            </MemoryRouter>
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should fetch baseline', () => {
        initialState.baselinesTableState.checkboxTable.baselineTableData = baselinesTableFixtures.baselineTableDataRows;
        const store = mockStore(initialState);
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesPage />
                </Provider>
            </MemoryRouter>
        );

        wrapper.find('a').first().simulate('click');
        expect(wrapper.find('Router').prop('history').location.pathname).toEqual('/baselines/1234');
    });

    it('should call revertBaselineFetch', () => {
        initialState.baselinesTableState.checkboxTable.baselineError = {
            detail: 'error',
            status: 404
        };
        initialState.baselinesTableState.checkboxTable.loading = true;
        const revertBaselineFetch = jest.fn();
        const store = mockStore(initialState);
        const wrapper = mount(
            <MemoryRouter keyLength={ 0 }>
                <Provider store={ store }>
                    <ConnectedBaselinesPage
                        revertBaselineFetch={ revertBaselineFetch }
                    />
                </Provider>
            </MemoryRouter>
        );

        const actions = store.getActions();
        wrapper.find('a').simulate('click');
        expect(actions).toEqual([{ type: 'REVERT_BASELINE_FETCH_CHECKBOX' }]);
    });
});
