import React from 'react';
import getRouter from './Routes';

import '../App.less';

export default class Index extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      forbid: false,
    };
  }
  render() {
    return (
      getRouter()
    );
  }
}
