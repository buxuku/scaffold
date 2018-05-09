import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';

function GoBack(props) {
  return (<Button
    onClick={() => (props.route
    ? props.history.push({ pathname: props.route })
    : props.history.goBack())}
  >返回上一级</Button>);
}
export default withRouter(GoBack);
