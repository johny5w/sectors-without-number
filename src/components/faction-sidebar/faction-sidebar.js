import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';

import SidebarContainer from 'primitives/container/sidebar-container';
import SectionHeader from 'primitives/text/section-header';
import ConfirmModal from 'primitives/modal/confirm-modal';

import FactionAssets from './faction-assets';
import FactionAttributes from './faction-attributes';
import styles from './styles.module.scss';

export default class FactionSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isConfirmDeleteOpen: false,
      isAttributesOpen: true,
      isAssetsOpen: true,
    };
  }

  render() {
    const {
      faction,
      intl,
      currentSector,
      currentFaction,
      removeFaction,
    } = this.props;
    if (!faction) {
      return null;
    }
    const { isAttributesOpen, isAssetsOpen, isConfirmDeleteOpen } = this.state;
    return (
      <SidebarContainer
        title={faction.name}
        actions={[
          {
            key: 'back',
            children: intl.formatMessage({ id: 'misc.back' }),
            to: `/elements/${currentSector}/faction`,
          },
          {
            key: 'edit',
            children: intl.formatMessage({ id: 'misc.edit' }),
            to: `/elements/${currentSector}/faction/${currentFaction}/edit`,
          },
          {
            key: 'delete',
            children: intl.formatMessage({ id: 'misc.delete' }),
            onClick: () => this.setState({ isConfirmDeleteOpen: true }),
          },
        ]}
      >
        <div>
          {!!faction.image && (
            <img
              src={faction.image}
              className={styles.image}
              alt={faction.name}
            />
          )}
          <SectionHeader
            isOpen={isAttributesOpen}
            onIconClick={() =>
              this.setState({ isAttributesOpen: !isAttributesOpen })
            }
            header="misc.attributes"
          />
          {isAttributesOpen && (
            <FactionAttributes className={styles.content} faction={faction} />
          )}
          <SectionHeader
            isOpen={isAssetsOpen}
            onIconClick={() => this.setState({ isAssetsOpen: !isAssetsOpen })}
            header="misc.assets"
          />
          {isAssetsOpen && <FactionAssets className={styles.content} />}
        </div>
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onConfirm={removeFaction}
          onCancel={() => this.setState({ isConfirmDeleteOpen: false })}
        >
          <FormattedMessage
            id="misc.toDeleteEntity"
            values={{
              entity: intl.formatMessage({ id: 'misc.faction' }),
            }}
          />
        </ConfirmModal>
      </SidebarContainer>
    );
  }
}

FactionSidebar.propTypes = {
  intl: intlShape.isRequired,
  faction: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
  }),
  currentSector: PropTypes.string.isRequired,
  currentFaction: PropTypes.string.isRequired,
  removeFaction: PropTypes.func.isRequired,
};

FactionSidebar.defaultProps = {
  faction: undefined,
};
