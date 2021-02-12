import { push } from 'connected-react-router';

import { deactivateSidebarEdit } from 'store/actions/sidebar.actions';
import { releaseSyncLock, entityRelease } from 'store/actions/sector.actions';
import {
  configurationSelector,
  currentSectorSelector,
  currentEntitySelector,
  currentEntityTypeSelector,
  entitySelector,
  sidebarEditSelector,
  holdKeySelector,
  hoverKeySelector,
  sectorSelector,
  syncLockSelector,
  isSharedSectorSelector,
  customTagSelector,
} from 'store/selectors/base.selectors';
import {
  getCurrentTopLevelEntities,
  getCurrentEntityType,
  getCurrentEntityId,
  getCurrentEntity,
  getCurrentSector,
} from 'store/selectors/entity.selectors';
import { isCurrentSectorSaved } from 'store/selectors/sector.selectors';

import {
  generateEntity as generateEntityUtil,
  deleteEntity as deleteEntityUtil,
  blacklistedAttributes,
  getTopLevelEntity,
  initialSyncToast,
  preventSync,
  saveEntities,
  deleteEntities,
  SYNC_TOAST_ID,
} from 'utils/entity';
import { updateEntity } from 'store/api/entity';
import Entities from 'constants/entities';
import { coordinatesFromKey } from 'utils/common';
import { removeToastById } from 'utils/toasts';
import {
  mapValues,
  merge,
  omit,
  omitBy,
  isNil,
  forEach,
  zipObject,
  pickBy,
  size,
} from 'constants/lodash';

const ACTION_PREFIX = '@@entity';
export const UPDATED_ENTITIES = `${ACTION_PREFIX}/UPDATED_ENTITIES`;
export const DELETED_ENTITIES = `${ACTION_PREFIX}/DELETED_ENTITIES`;
export const SAVED_SECTOR = `${ACTION_PREFIX}/SAVED_SECTOR`;
export const UPDATED_ID_MAPPING = `${ACTION_PREFIX}/UPDATED_ID_MAPPING`;

const updateHandler = (state, dispatch, { action, mapping }, isSynced) => {
  const dispatches = [dispatch(releaseSyncLock())];
  if (isSynced) {
    dispatches.push(dispatch(removeToastById(SYNC_TOAST_ID)));
  }
  if (action) {
    dispatches.push(dispatch(action));
  }
  if (!size(mapping || {})) {
    return Promise.all(dispatches);
  }
  const currentEntity = currentEntitySelector(state);
  const currentEntityType = currentEntityTypeSelector(state);
  const entityUrl = currentEntity
    ? `/${currentEntityType}/${mapping[currentEntity] || currentEntity}`
    : '';
  return Promise.all([
    ...dispatches,
    dispatch({ type: UPDATED_ID_MAPPING, mapping }),
  ]).then(() => {
    const currentSector = currentSectorSelector(state);
    const newSector = mapping[currentSector] || currentSector;
    return dispatch(push(`/sector/${newSector}${entityUrl}`));
  });
};

export const generateEntity = (entity, parameters, intl) => (
  dispatch,
  getState,
) => {
  const isSector = entity.entityType === Entities.sector.key;
  if (dispatch(preventSync(intl, isSector))) {
    return Promise.resolve();
  }
  const state = getState();
  const entities = generateEntityUtil({
    entity,
    currentSector: currentSectorSelector(state),
    configuration: configurationSelector(state),
    customTags: customTagSelector(state),
    parameters,
  });
  dispatch({
    type: UPDATED_ENTITIES,
    entities,
  });

  const currentSector = currentSectorSelector(state);
  const existingSector = sectorSelector(state)[currentSector];
  const newSectorKeys = Object.keys(entities.sector || {});
  if ((!currentSector || !existingSector) && newSectorKeys.length) {
    dispatch(push(`/sector/${newSectorKeys[0]}`));
  }

  if (!isSector) {
    return initialSyncToast(state, dispatch, intl).then(isInitialSync =>
      saveEntities({ state, created: entities, entities }, intl).then(results =>
        updateHandler(state, dispatch, results, isInitialSync),
      ),
    );
  }
  return dispatch(releaseSyncLock());
};

export const moveTopLevelEntity = intl => (dispatch, getState) => {
  if (dispatch(preventSync(intl))) {
    return dispatch(entityRelease());
  }
  const state = getState();
  const topLevelEntities = getCurrentTopLevelEntities(state);
  const holdKey = holdKeySelector(state);
  const holdEntity = getTopLevelEntity(topLevelEntities, holdKey);
  const hoverKey = hoverKeySelector(state) || holdKey;
  const hoverEntity = getTopLevelEntity(topLevelEntities, hoverKey);
  const holdUpdate = { ...holdEntity.entity, ...coordinatesFromKey(hoverKey) };
  let entities = {
    [holdEntity.entityType]: {
      [holdEntity.entityId]: omit(holdUpdate, ['numChildren', 'type']),
    },
  };
  if (hoverEntity.entity) {
    const hoverUpdate = {
      ...omit(hoverEntity.entity, ['numChildren', 'type']),
      x: holdEntity.entity.x,
      y: holdEntity.entity.y,
    };
    entities = {
      ...entities,
      [hoverEntity.entityType]: {
        ...(entities[hoverEntity.entityType] || {}),
        [hoverEntity.entityId]: hoverUpdate,
      },
    };
  }
  return Promise.all([
    initialSyncToast(state, dispatch, intl),
    dispatch({ type: UPDATED_ENTITIES, entities }),
  ]).then(([isInitialSync]) =>
    saveEntities({ state, updated: entities, entities }, intl).then(results =>
      updateHandler(state, dispatch, results, isInitialSync),
    ),
  );
};

export const deleteEntity = intl => (dispatch, getState) => {
  if (dispatch(preventSync(intl))) {
    return Promise.resolve();
  }
  const state = getState();
  const entity = getCurrentEntity(state);
  const currentSector = currentSectorSelector(state);
  if (!entity.parent) {
    dispatch(push('/'));
  } else if (entity.parent === currentSector) {
    dispatch(push(`/sector/${entity.parent}`));
  } else {
    dispatch(
      push(`/sector/${currentSector}/${entity.parentEntity}/${entity.parent}`),
    );
  }
  const deleted = deleteEntityUtil({
    entityType: getCurrentEntityType(state),
    entityId: getCurrentEntityId(state),
    entities: entitySelector(state),
  });
  dispatch({
    type: DELETED_ENTITIES,
    entities: deleted,
  });
  return deleteEntities({ state, deleted }, intl).then(results =>
    updateHandler(state, dispatch, results),
  );
};

export const saveSector = intl => (dispatch, getState) => {
  if (dispatch(preventSync(intl))) {
    return Promise.resolve();
  }
  const state = getState();
  return Promise.all([
    initialSyncToast(state, dispatch, intl),
    dispatch({ type: SAVED_SECTOR }),
  ]).then(([isInitialSync]) =>
    saveEntities({ state }, intl).then(results =>
      updateHandler(state, dispatch, results, isInitialSync),
    ),
  );
};

export const saveEntityEdit = intl => (dispatch, getState) => {
  if (dispatch(preventSync(intl))) {
    return dispatch(deactivateSidebarEdit());
  }
  const state = getState();
  const currentEntityType = getCurrentEntityType(state);
  const currentEntityId = getCurrentEntityId(state);
  const { entity, children } = sidebarEditSelector(state);

  let createdEntities = {};
  const deletedEntities = {};
  let updatedEntities = mapValues(children, (entities, thisEntityType) =>
    omitBy(
      mapValues(
        entities,
        ({ isCreated, isDeleted, isUpdated, ...thisEntity }, thisEntityId) => {
          const filteredEntity = omit(thisEntity, blacklistedAttributes);
          if (isCreated) {
            createdEntities = merge(
              createdEntities,
              generateEntityUtil({
                entity: { entityType: thisEntityType },
                currentSector: currentSectorSelector(state),
                configuration: configurationSelector(state),
                parameters: {
                  ...filteredEntity,
                  parentEntity: currentEntityType,
                  parent: currentEntityId,
                },
              }),
            );
          } else if (isDeleted) {
            forEach(
              deleteEntityUtil({
                entityType: thisEntityType,
                entityId: thisEntityId,
                entities: entitySelector(state),
              }),
              (entityIdArray, deletedType) => {
                deletedEntities[deletedType] = [
                  ...(deletedEntities[deletedType] || []),
                  ...entityIdArray,
                ];
              },
            );
          }
          return isDeleted || isCreated || !isUpdated
            ? undefined
            : filteredEntity;
        },
      ),
      isNil,
    ),
  );

  if (entity.isUpdated) {
    const entities = entitySelector(state);
    updatedEntities = merge(updatedEntities, {
      [currentEntityType]: {
        [currentEntityId]: omit(
          {
            ...entities[currentEntityType][currentEntityId],
            ...entity,
          },
          blacklistedAttributes,
        ),
      },
    });
  }

  let allEntities = {
    ...updatedEntities,
    ...mapValues(createdEntities, (entityList, entityType) => ({
      ...entityList,
      ...(updatedEntities[entityType] || {}),
    })),
  };
  allEntities = merge(
    allEntities,
    mapValues(deletedEntities, deletedIds =>
      zipObject(
        deletedIds,
        deletedIds.map(() => null),
      ),
    ),
  );

  const filteredUpdatedEntities = pickBy(allEntities, size);
  if (size(filteredUpdatedEntities)) {
    return Promise.all([
      initialSyncToast(state, dispatch, intl),
      dispatch({
        type: UPDATED_ENTITIES,
        entities: filteredUpdatedEntities,
      }),
    ]).then(([isInitialSync]) =>
      saveEntities(
        {
          entities: filteredUpdatedEntities,
          updated: updatedEntities,
          created: createdEntities,
          deleted: deletedEntities,
          state,
        },
        intl,
      ).then(results => updateHandler(state, dispatch, results, isInitialSync)),
    );
  }
  return Promise.all([
    dispatch(deactivateSidebarEdit()),
    dispatch(releaseSyncLock()),
  ]);
};

export const toggleMapLock = () => (dispatch, getState) => {
  const state = getState();
  const sectorId = currentSectorSelector(state);
  const sector = getCurrentSector(state);
  if (!sectorId || !sector || syncLockSelector(state)) {
    return Promise.resolve();
  }
  dispatch({
    type: UPDATED_ENTITIES,
    entities: {
      [Entities.sector.key]: {
        [sectorId]: {
          mapLocked: !sector.mapLocked,
        },
      },
    },
  });
  return updateEntity(sectorId, Entities.sector.key, {
    mapLocked: !sector.mapLocked,
  }).then(() => dispatch(releaseSyncLock()));
};

export const toggleLayer = layerId => (dispatch, getState) => {
  const state = getState();
  const sectorId = currentSectorSelector(state);
  const sector = getCurrentSector(state);
  if (!sectorId || !sector || syncLockSelector(state)) {
    return Promise.resolve();
  }

  const layers = sector.layers || {};
  const layerToggle = layers[layerId] !== undefined && !layers[layerId];

  const sectorUpdate = {
    layers: {
      ...layers,
      [layerId]: layerToggle,
    },
  };
  dispatch({
    type: UPDATED_ENTITIES,
    entities: {
      [Entities.sector.key]: {
        [sectorId]: sectorUpdate,
      },
    },
  });
  if (isSharedSectorSelector(state) || !isCurrentSectorSaved(state)) {
    return Promise.resolve(dispatch(releaseSyncLock()));
  }
  return updateEntity(sectorId, Entities.sector.key, sectorUpdate).then(() =>
    dispatch(releaseSyncLock()),
  );
};
