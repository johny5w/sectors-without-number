import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { map, mapValues } from 'constants/lodash';

import EntityAttributes from './entity-attributes';
import EntityList from './entity-list';
import EntityTags from './entity-tags';

import styles from './styles.module.scss';

export default class DefaultSidebar extends Component {
  constructor(props) {
    super(props);

    const { entityType, entityChildren } = props;
    this.state = {
      entityType, // eslint-disable-line
      openLists: {
        ...mapValues(entityChildren, () => true),
        attributes: true,
        tags: true,
      },
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.entityType !== props.entityType) {
      return {
        ...state,
        entityType: props.entityType,
        openLists: {
          ...mapValues(props.entityChildren, () => true),
          attributes: true,
          tags: true,
        },
      };
    }
    return state;
  }

  toggleListOpen = entityType => () => {
    const { openLists } = this.state;
    this.setState({
      openLists: {
        ...openLists,
        [entityType]: !openLists[entityType],
      },
    });
  };

  renderEntityImage() {
    const { entity, isShared, isSidebarEditActive } = this.props;
    const isHidden = (entity.visibility || {})['attr.image'] === false;
    if (isSidebarEditActive || !entity.image || (isShared && isHidden)) {
      return null;
    }
    return (
      <img src={entity.image} className={styles.entityImg} alt={entity.name} />
    );
  }

  render() {
    const { openLists } = this.state;
    const { entityChildren } = this.props;
    return (
      <>
        {this.renderEntityImage()}
        <EntityAttributes
          isOpen={openLists.attributes}
          toggleOpen={this.toggleListOpen('attributes')}
        />
        {map(entityChildren, (entities, entityType) => (
          <EntityList
            key={entityType}
            entities={entities}
            entityType={entityType}
            isOpen={openLists[entityType]}
            toggleListOpen={this.toggleListOpen(entityType)}
          />
        ))}
        <EntityTags
          isOpen={openLists.tags}
          toggleOpen={this.toggleListOpen('tags')}
        />
      </>
    );
  }
}

DefaultSidebar.propTypes = {
  isShared: PropTypes.bool.isRequired,
  isSidebarEditActive: PropTypes.bool.isRequired,
  entityChildren: PropTypes.shape().isRequired,
  entityType: PropTypes.string,
  entity: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    visibility: PropTypes.shape(),
  }).isRequired,
};

DefaultSidebar.defaultProps = {
  entityType: undefined,
};
