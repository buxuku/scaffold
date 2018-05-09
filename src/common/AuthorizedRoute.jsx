import React from 'react';
import Route from 'react-router-dom/Route';
import PropTypes from 'prop-types';

const SideBarLayout = ({ component: Component, ...rest }) => {
  const { layout } = rest;
  return (
    <Route
      {...rest}
      render={matchProps =>  (
          <Component {...matchProps} />
        )}
    />
  );
};
SideBarLayout.propTypes = {
  component: PropTypes.func.isRequired,
};

const ARouter = ({ component: Component, ...rest }) => {
  return <SideBarLayout {...rest} component={Component} />;
};
ARouter.propTypes = {
  component: PropTypes.func.isRequired,
};
export default ARouter;
