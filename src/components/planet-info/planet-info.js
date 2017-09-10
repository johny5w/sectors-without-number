import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SidebarNavigation, { SidebarType } from 'components/sidebar-navigation';
import SectionHeader from 'primitives/text/section-header';
import Header, { HeaderType } from 'primitives/text/header';
import Modal from 'primitives/other/modal';
import Button from 'primitives/other/button';
import { capitalizeFirstLetter } from 'utils/common';
import WorldTags from 'constants/world-tags';
import Atmosphere from 'constants/atmosphere';
import Temperature from 'constants/temperature';
import Biosphere from 'constants/biosphere';
import Population from 'constants/population';

import './style.css';

const renderList = (title, list) => (
  <div className="PlanetInfo-Content">
    <b>{title}:</b>
    <ul className="PlanetInfo-ContentList">
      {list
        .map(capitalizeFirstLetter)
        .map(element => <li key={element}>{element}</li>)}
    </ul>
  </div>
);

const renderTags = (tags = []) =>
  tags
    .map(tag => WorldTags[tag])
    .map(
      ({
        key,
        name,
        description,
        enemies,
        friends,
        complications,
        things,
        places,
      }) => (
        <div key={key} className="PlanetInfo-Tag">
          <Header type={HeaderType.header4}>{name}</Header>
          <p className="PlanetInfo-Content">{description}</p>
          {renderList('Enemies', enemies)}
          {renderList('Friends', friends)}
          {renderList('Complications', complications)}
          {renderList('Things', things)}
          {renderList('Places', places)}
        </div>
      ),
    );

const renderAttribute = (title, attribute, obj) => (
  <p className="PlanetInfo-Attribute">
    <b>{title}:</b> {obj ? (obj[attribute] || {}).name : attribute}
  </p>
);

export default class PlanetInfo extends Component {
  static propTypes = {
    planet: PropTypes.shape({
      name: PropTypes.string.isRequired,
      techLevel: PropTypes.string.isRequired,
      atmosphere: PropTypes.string.isRequired,
      temperature: PropTypes.string.isRequired,
      biosphere: PropTypes.string.isRequired,
      population: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
      search: PropTypes.string,
    }).isRequired,
    routeParams: PropTypes.shape({
      system: PropTypes.string.isRequired,
      planet: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  state = {
    isOpen: false,
  };

  onEdit() {
    this.setState({ isOpen: true });
  }

  onClose() {
    this.setState({ isOpen: false });
  }

  render() {
    return (
      <SidebarNavigation
        name={this.props.planet.name}
        back={`/sector/system/${this.props.routeParams.system}${this.props
          .location.search}`}
        type={SidebarType.planet}
        onEdit={this.onEdit}
      >
        <SectionHeader>Attributes</SectionHeader>
        {renderAttribute('Tech Level', this.props.planet.techLevel)}
        {renderAttribute(
          'Atmosphere',
          this.props.planet.atmosphere,
          Atmosphere,
        )}
        {renderAttribute(
          'Temperature',
          this.props.planet.temperature,
          Temperature,
        )}
        {renderAttribute('Biosphere', this.props.planet.biosphere, Biosphere)}
        {renderAttribute(
          'Population',
          this.props.planet.population,
          Population,
        )}
        <SectionHeader>World Tags</SectionHeader>
        <div className="PlanetInfo-Section">
          {renderTags(this.props.planet.tags)}
        </div>
        <Modal
          isOpen={this.state.isOpen}
          onCancel={this.onClose}
          title="Edit Planet"
          actionButtons={[
            <Button primary key="save">
              Save Planet
            </Button>,
          ]}
        >
          <p>some input element... blah blah</p>
        </Modal>
      </SidebarNavigation>
    );
  }
}
