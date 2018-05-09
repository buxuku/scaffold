import React from 'react';
import ReactDom from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Index from './common/Index';


function renderWithHotReload(RootElement) {
  ReactDom.render(
    <AppContainer>
      <RootElement />
    </AppContainer>,
    document.getElementById('container'),
  );
}
renderWithHotReload(Index);


if (module.hot) {
  module.hot.accept('./common/Index', () => {
    const Index = require('./common/Index').default;
    renderWithHotReload(Index);
  });
}

