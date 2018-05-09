import React from 'react';
import { HashRouter as Router, Switch } from 'react-router-dom';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import ARoute from './AuthorizedRoute';
import PromotionList from '../components/marketing/promotion/List';
import PromotionSaleOrder from '../components/marketing/promotion/SaleOrder';
import PormotionView from '../components/marketing/promotion/View';
import NotFoundPage from '../components/NotFoundPage';

const getRouter = () => (
  <LocaleProvider locale={zhCN}>
    <Router>
      <Switch>
        <ARoute exact path="/" component={PromotionList} />
        <ARoute exact path="/promotion" component={PromotionList} />
        <ARoute exact path="/promotion/saleorder/:id" component={PromotionSaleOrder} />
        <ARoute exact path="/promotion/view/:id" component={PormotionView} />
        <ARoute layout="404" component={NotFoundPage} />
      </Switch>
    </Router>
  </LocaleProvider>
);

export default getRouter;
