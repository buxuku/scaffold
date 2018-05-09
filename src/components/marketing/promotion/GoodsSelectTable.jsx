import React from 'react';
import { Table, Icon, Select, InputNumber, Tooltip } from 'antd';
import { NetUitl } from 'gui';
import _ from 'lodash';

const Option = Select.Option;
class GoodsTable extends React.Component {
  constructor(props) {
    super(props);
    this.newGoodsItemKey = -1;
    this.state = {
      items: [],
      removedItems: [],
      goodsList: [],
      params: {
        sortField: 'USABLE_NUMBER',
        sort: 'DESC',
        pageSize: 100,
      },
    };
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.batchPromotionPrice !== this.props.batchPromotionPrice) {
      const items = this.state.items.map(item =>
        Object.assign(item, {}, { promotionPrice: item.price - (item.shareMoney -
          +nextProps.batchPromotionPrice),
          promotionShareMoney: +nextProps.batchPromotionPrice }));
      this.setState({
        items,
      });
    }
    if ('items' in nextProps) {
      this.setState({
        items: nextProps.items,
      });
    }
  }
  removeGoodsItem = (row) => {
    const items = this.state.items.filter(item => item.id !== row.id);
    const removedItems = this.state.removedItems;
    removedItems.push(row.id);
    this.setState({
      items,
      removedItems,
    });
    this.handleResult(items, removedItems);
  }
  handleSearchGoods = (value) => {
    if (value) {
      const params = {
        searchText: value,
        sortField: 'USABLE_NUMBER',
        sort: 'DESC',
      };
      NetUitl.get('/api/v1/commodities', params, (res) => {
        this.setState({
          goodsList: res.data.items,
        });
      });
    }
  }
  handleSelectGoods = (selectedGoodsId) => {
    const goodsItem = _.head(this.state.goodsList.filter(item => item.id === +selectedGoodsId));
    const items = _.cloneDeep(this.state.items);
    delete goodsItem.promotionPrice;
    items.push(goodsItem);
    this.setState({
      items,
      goodsList: [],
    });
    this.handleResult(items);
  }
  handleResult = (items, removedItems = null) => {
    const resultItems = items.filter(item => item.id > 0);
    this.props.onResult(resultItems, removedItems);
  }
  handleChangeNumber = (e, row) => {
    const items = _.cloneDeep(this.state.items);
    const index = _.findIndex(items, { id: row.id });
    items[index].promotionShareMoney = e;
    if (_.isNumber(e)) {
      items[index].promotionPrice = items[index].price - (items[index].shareMoney - e);
    } else {
      delete items[index].promotionPrice;
    }
    this.setState({
      items,
    });
    this.handleResult(items);
  }
  render() {
    const list = _.cloneDeep(this.state.items);
    list.push({
      id: -1,
    });
    const columns = [{
      key: 'id',
      width: 48,
      render: row => (row.id > 0 && <div className="g-action-icon" title="删除"><Icon type="minus-square-o" onClick={() => this.removeGoodsItem(row)} /></div>),
    }];
    columns.push(...[{
      title: '商品信息',
      dataIndex: 'name',
      className: 'g-td-left',
      width: 400,
      render: (value, row) => (
        row.id < 0
        ? <Select
          showSearch
          placeholder="输入商品货号、名称搜索"
          notFoundContent={<span>请输入货号或者商品名称进行搜索</span>}
          onSearch={this.handleSearchGoods}
          onSelect={(selectedGoodsId, option) =>
            this.handleSelectGoods(selectedGoodsId, option)}
          filterOption={false}
          optionLabelProp="name"
          defaultActiveFirstOption={false}
          value={undefined}
          style={{ width: '330px' }}
        >
          {this.state.goodsList.map(item => (
            <Option
              disabled={_.findIndex(this.state.items, { id: item.id }) > -1
                || (item.inPromotion && !_.includes(this.state.removedItems, item.id))}
              key={item.id.toString()}
              name={item.name}
              value={item.id.toString()}
            >
              <p className="g-goods-option">
                <b>{item.articleNumber}{_.findIndex(this.state.items, { id: item.id }) > -1
                  && <span>商品已添加</span>}
                  {(item.inPromotion
                    && !_.includes(this.state.removedItems, item.id))
                    && !(_.findIndex(this.state.items, { id: item.id }) > -1)
                      && <span>商品已参加其它特价活动</span>}</b>
                <br />
                {item.name}
              </p>
            </Option>
          ))}
        </Select>
        : `[${row.articleNumber}]${value}`
      ),
    }, {
      title: '商品分类',
      width: 128,
      className: 'g-td-left',
      dataIndex: 'classify',
      render: value => (value && `${value.parent.name}-${value.name}`) || '-',
    }, {
      width: 112,
      title: '该呀价(元)',
      className: 'g-td-left',
      dataIndex: 'price',
      render: value => value || '-',
    }, {
      width: 168,
      title: <Tooltip title="活动价格=该呀价-(原始分润-促销分润)" style={{ width: '288px' }}><span>活动价格(元)<Icon type="question-circle" style={{ color: 'rgba(83,149,233,.4)', fontSize: '24px', verticalAlign: 'middle', marginLeft: '8px' }} /></span></Tooltip>,
      className: 'g-td-left',
      dataIndex: 'promotionPrice',
      render: value => value || '-',
    }, {
      width: 156,
      title: '供应商原始分润(元)',
      className: 'g-td-left',
      dataIndex: 'shareMoney',
      render: value => value || '-',
    }, {
      title: '供应商促销分润(元)',
      className: 'g-td-left',
      key: 'ids',
      render: (value, row) => (row.id > 0 ?
        <span className={(row.promotionPrice > row.price || (this.props.check && !row.promotionPrice)) ? 'has-error' : ''}>
          <InputNumber
            min={0}
            value={row.promotionShareMoney
              || (row.promotionPrice ? row.shareMoney - (row.price - row.promotionPrice) : null)}
            onChange={e => this.handleChangeNumber(e, row)}
            placeholder="请输入"
          />
        </span>
      : '-'),
    }]);
    return (
      <div>
        <Table size="middle" columns={columns} pagination={false} rowKey={'id'} dataSource={list} />
      </div>
    );
  }
}
export default GoodsTable;
