import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import classNames from 'classnames';
import { X } from 'react-feather';
import { FormattedMessage, intlShape } from 'react-intl';

import Button from 'primitives/other/button';
import FlexContainer from 'primitives/container/flex-container';
import Label from 'primitives/form/label';
import Input from 'primitives/form/input';

import './style.scss';

const LOGIN_PAGE_TYPES = {
  login: 'login',
  signup: 'signup',
  forget: 'forget',
};

export default class LoginModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: LOGIN_PAGE_TYPES.login,
    };
  }

  onConfirm = () => {
    const { page } = this.state;
    const { login, signup, passwordReset } = this.props;
    if (page === LOGIN_PAGE_TYPES.login) {
      login();
    } else if (page === LOGIN_PAGE_TYPES.signup) {
      signup();
    } else {
      passwordReset();
    }
  };

  onEditText = ({ target }) => {
    const { updateUserForm } = this.props;
    updateUserForm(target.dataset.key, target.value);
  };

  renderPassword() {
    const { page } = this.state;
    if (page === LOGIN_PAGE_TYPES.forget) {
      return null;
    }
    const { intl, password } = this.props;
    return (
      <div>
        <Label htmlFor="password">
          <FormattedMessage id="misc.password" />
        </Label>
        <Input
          id="password"
          name="password"
          data-key="password"
          type="password"
          placeholder={intl.formatMessage({ id: 'misc.password' })}
          value={password}
          onChange={this.onEditText}
        />
      </div>
    );
  }

  renderForgotPassword() {
    const { page } = this.state;
    if (page !== LOGIN_PAGE_TYPES.login) {
      return null;
    }
    return (
      <div className="LoginModal-Forgot">
        <Button
          minimal
          onClick={() => this.setState({ page: LOGIN_PAGE_TYPES.forget })}
        >
          <FormattedMessage id="misc.forgotPassword" />
        </Button>
      </div>
    );
  }

  renderPasswordConfirm() {
    const { page } = this.state;
    if (page !== LOGIN_PAGE_TYPES.signup) {
      return null;
    }
    const { intl, confirm } = this.props;
    return (
      <div>
        <Label htmlFor="confirm">
          <FormattedMessage id="misc.confirmPassword" />
        </Label>
        <Input
          id="confirm"
          name="confirm"
          data-key="confirm"
          type="password"
          placeholder={intl.formatMessage({ id: 'misc.confirm' })}
          value={confirm}
          onChange={this.onEditText}
        />
      </div>
    );
  }

  renderError() {
    const { error } = this.props;
    if (!error) {
      return null;
    }
    return (
      <FlexContainer className="LoginModal-Error" justify="center">
        {error}
      </FlexContainer>
    );
  }

  render() {
    const { page } = this.state;
    const {
      isLoginModalOpen,
      closeLoginModal,
      googleLogin,
      intl,
      email,
    } = this.props;
    let actionText = <FormattedMessage id="misc.sendReset" />;
    if (page === LOGIN_PAGE_TYPES.login) {
      actionText = <FormattedMessage id="misc.logIn" />;
    } else if (page === LOGIN_PAGE_TYPES.signup) {
      actionText = <FormattedMessage id="misc.signUp" />;
    }

    return (
      <ReactModal
        contentLabel="Signup & Login"
        isOpen={isLoginModalOpen}
        onCancel={closeLoginModal}
        className="LoginModal"
        overlayClassName="LoginModal-Overlay"
        ariaHideApp={false}
      >
        <X className="LoginModal-Close" onClick={closeLoginModal} size={30} />
        <FlexContainer justify="center" align="center" direction="column">
          <Button className="LoginModal-Google" onClick={googleLogin}>
            <FormattedMessage id="misc.google" />
          </Button>
        </FlexContainer>
        <FlexContainer
          className="LoginModal-LineContainer"
          align="center"
          justify="center"
        >
          <span className="LoginModal-Line" />
          <span className="LoginModal-Or">
            <FormattedMessage id="misc.or" />
          </span>
          <span className="LoginModal-Line" />
        </FlexContainer>
        <FlexContainer className="LoginModal-Switcher" justify="center">
          <button
            type="submit"
            onClick={() => this.setState({ page: LOGIN_PAGE_TYPES.login })}
            className={classNames('LoginModal-SwitchButton', {
              'LoginModal-SwitchButton--active':
                page === LOGIN_PAGE_TYPES.login,
            })}
          >
            <FormattedMessage id="misc.logIn" />
          </button>
          <button
            type="submit"
            onClick={() => this.setState({ page: LOGIN_PAGE_TYPES.signup })}
            className={classNames('LoginModal-SwitchButton', {
              'LoginModal-SwitchButton--active':
                page === LOGIN_PAGE_TYPES.signup,
            })}
          >
            <FormattedMessage id="misc.signUp" />
          </button>
        </FlexContainer>
        <FlexContainer
          className="LoginModal-FormContainer"
          justify="center"
          direction="column"
        >
          <Label noPadding htmlFor="email">
            <FormattedMessage id="misc.email" />
          </Label>
          <Input
            id="email"
            name="email"
            data-key="email"
            placeholder={intl.formatMessage({ id: 'misc.email' })}
            value={email}
            onChange={this.onEditText}
          />
          {this.renderPassword()}
          {this.renderForgotPassword()}
          {this.renderPasswordConfirm()}
          {this.renderError()}
          <FlexContainer className="LoginModal-Submit" justify="center">
            <Button primary key="submit" onClick={this.onConfirm}>
              {actionText}
            </Button>
          </FlexContainer>
        </FlexContainer>
      </ReactModal>
    );
  }
}

LoginModal.propTypes = {
  isLoginModalOpen: PropTypes.bool.isRequired,
  closeLoginModal: PropTypes.func.isRequired,
  updateUserForm: PropTypes.func.isRequired,
  googleLogin: PropTypes.func.isRequired,
  signup: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  passwordReset: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  confirm: PropTypes.string.isRequired,
  error: PropTypes.string,
  intl: intlShape.isRequired,
};

LoginModal.defaultProps = {
  error: null,
};
