import { LOCATION_CHANGE } from 'connected-react-router';

import {
  UPDATED_CONFIGURATION,
  ENTITY_HELD,
  RELEASE_HELD,
  ENTITY_HOVERED,
  RELEASED_SYNC_LOCK,
  TOP_LEVEL_ENTITY_CREATED,
  CANCELED_TOP_LEVEL_ENTITY_CREATE,
  SET_EXPORT_TYPE,
  OPENED_EXPORT,
  CLOSED_EXPORT,
  OPENED_SECTOR_EXPANSION,
  CLOSED_SECTOR_EXPANSION,
  PRINTING_STARTED,
  PRINTING_COMPLETE,
  CLEARED_MAP_KEYS,
  TOGGLE_PLAYER_VIEW,
} from 'store/actions/sector.actions';
import {
  SAVED_SECTOR,
  UPDATED_ENTITIES,
  DELETED_ENTITIES,
  UPDATED_ID_MAPPING,
} from 'store/actions/entity.actions';
import {
  INITIALIZED,
  FETCHED_SECTOR,
  EXPAND_SECTOR,
} from 'store/actions/combined.actions';
import { LOGGED_OUT } from 'store/actions/user.actions';

import { keys, uniq } from 'constants/lodash';
import { ROWS, COLUMNS } from 'constants/defaults';
import Entities from 'constants/entities';
import ExportTypes from 'constants/export-types';

const initialState = {
  fetched: [],
  renderSector: false,
  holdKey: null,
  hoverKey: null,
  topLevelKey: null,
  syncLock: false,
  exportType: ExportTypes.condensed.key,
  isExportOpen: false,
  isSectorExpansionOpen: false,
  isPrinting: false,
  playerView: false,
  configuration: {
    sectorName: Entities.sector.nameGenerator(),
    isBuilder: false,
    additionalPointsOfInterest: true,
    hideOccAndSit: true,
    useCustomTags: true,
    hideTags: true,
    columns: COLUMNS,
    rows: ROWS,
  },
};

export default function sector(state = initialState, action) {
  switch (action.type) {
    case INITIALIZED:
    case FETCHED_SECTOR:
      return {
        ...state,
        fetched: uniq([...state.fetched, action.sectorId]).filter(f => f),
      };
    case UPDATED_ID_MAPPING:
      return {
        ...state,
        fetched: uniq(state.fetched.map(id => action.mapping[id] || id)),
      };
    case LOCATION_CHANGE: {
      const { pathname } = action.payload.location;
      if (['/', '/configure', '/changelog'].indexOf(pathname) >= 0) {
        document.title = 'Sectors Without Number';
        return {
          ...initialState,
          renderSector: false,
          playerView: false,
          fetched: state.fetched,
          configuration: {
            ...initialState.configuration,
            sectorName: Entities.sector.nameGenerator(),
          },
        };
      }
      if (pathname.startsWith('/sector/')) {
        return { ...state, renderSector: true };
      }
      return { ...state, renderSector: false };
    }
    case UPDATED_ENTITIES:
    case EXPAND_SECTOR:
      return {
        ...state,
        holdKey: null,
        fetched: uniq([
          ...state.fetched,
          ...keys(action.entities[Entities.sector.key]),
        ]),
        hoverKey: null,
        topLevelKey: null,
        syncLock: true,
        isSectorExpansionOpen: false,
      };
    case SAVED_SECTOR:
    case DELETED_ENTITIES:
      return {
        ...state,
        holdKey: null,
        hoverKey: null,
        topLevelKey: null,
        syncLock: true,
      };
    case UPDATED_CONFIGURATION:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          [action.key]: action.value,
        },
      };
    case ENTITY_HELD:
      return { ...state, holdKey: action.key };
    case RELEASE_HELD:
      return { ...state, holdKey: null };
    case ENTITY_HOVERED:
      return { ...state, hoverKey: action.key };
    case RELEASED_SYNC_LOCK:
      return { ...state, syncLock: false };
    case TOP_LEVEL_ENTITY_CREATED:
      return { ...state, topLevelKey: action.key };
    case CANCELED_TOP_LEVEL_ENTITY_CREATE:
      return { ...state, topLevelKey: null };
    case SET_EXPORT_TYPE:
      return { ...state, exportType: action.exportType };
    case OPENED_EXPORT:
      return { ...state, isExportOpen: true };
    case CLOSED_EXPORT:
      return {
        ...state,
        isExportOpen: false,
        exportType: ExportTypes.condensed.key,
      };
    case OPENED_SECTOR_EXPANSION:
      return { ...state, isSectorExpansionOpen: true };
    case CLOSED_SECTOR_EXPANSION:
      return { ...state, isSectorExpansionOpen: false };
    case PRINTING_STARTED:
      return { ...state, isExportOpen: false, isPrinting: true };
    case PRINTING_COMPLETE:
      return { ...state, isPrinting: false };
    case CLEARED_MAP_KEYS:
      return { ...state, holdKey: null, hoverKey: null };
    case TOGGLE_PLAYER_VIEW:
      return { ...state, playerView: !state.playerView };
    case LOGGED_OUT:
      return initialState;
    default:
      return state;
  }
}
