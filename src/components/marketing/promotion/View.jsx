import React from 'react';
import { Table, Tooltip, Icon, Button } from 'antd';
import { GoBack, NetUitl } from 'gui';
import Records from './Records';
import StatusTag from '../../../common/StatusTag';

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      records: [],
    };
  }
  componentDidMount() {
    NetUitl.get(`/api/v1/promotions/${this.props.match.params.id}`, {}, (res) => {
      this.setState({
        ...res.data,
      });
    });
  }
  handleLinkSaleOrder = () => {
    this.props.history.push({
      pathname: `/promotion/saleorder/${this.props.match.params.id}`,
      state: this.state,
    });
  }
  render() {
    const goodsColumns = [{
      key: 'id',
      width: 48,
    }, {
      title: '商品信息',
      dataIndex: 'name',
      className: 'g-td-left',
      width: 400,
      render: (value, row) => `[${row.articleNumber}]${value}`,
    }, {
      title: '商品分类',
      width: 128,
      className: 'g-td-left',
      dataIndex: 'classify',
      render: value => value && `${value.parent.name}-${value.name}`,
    }, {
      width: 112,
      title: '该呀价(元)',
      className: 'g-td-left',
      dataIndex: 'price',
    }, {
      width: 168,
      title: <Tooltip title="活动价格=该呀价-(原始分润-促销分润)" style={{ width: '288px' }}><span>活动价格(元)<Icon type="question-circle" style={{ color: 'rgba(83,149,233,.4)', fontSize: '24px', verticalAlign: 'middle', marginLeft: '8px' }} /></span></Tooltip>,
      className: 'g-td-left',
      dataIndex: 'promotionPrice',
    }, {
      width: 156,
      title: '供应商原始分润(元)',
      className: 'g-td-left',
      dataIndex: 'shareMoney',
    }, {
      title: '供应商促销分润(元)',
      className: 'g-td-left',
      dataIndex: 'promotionShareMoney',
      render: (value, row) => row.shareMoney - (row.price - row.promotionPrice ),
    }];
    const { name,
      auto,
      startTime,
      endTime,
      remark,
      items,
      disableRemark, records, status, statusDesc } = this.state;
    let type;
    switch (status) {
      case 1 :
        type = 'working';
        break;
      default :
        type = 'close';
    }
    return (
      <div>
        <div className="g-mainbg  g-top-line">
          <h1 className="g-main-title">
            活动信息
            <StatusTag type={type} title={statusDesc} />
          </h1>
          <div className="g-actions-link" style={{ top: '16px', right: '16px' }}>
            <GoBack />
            <Button onClick={this.handleLinkSaleOrder} type="primary">查看购买记录</Button>
          </div>
          <div className="g-form-view" style={{ padding: '0 16px 24px' }}>
            <p>
              <span className="g-form-view-label">活动名称:</span>{name}
            </p>
            <p>
              <span className="g-form-view-label">定时启动:</span>{auto ? '是' : '否'}
            </p>
            <p>
              <span className="g-form-view-label">活动有效期:</span>{startTime} - {endTime || '长期有效'}
            </p>
            <p>
              <span className="g-form-view-label">备注:</span>{remark || '无'}
            </p>
            {(status === 2 || status === 3) && <p>
              <span className="g-form-view-label">{status === 2 ? '停用' : '取消'}原因:</span>{disableRemark || '无'}
            </p>}
          </div>
        </div>
        <div className="g-mainbg" style={{ marginTop: '8px' }}>
          <h1 className="g-main-title">
            商品信息
          </h1>
          <div style={{ padding: '0 16px 35px' }}>
            <Table columns={goodsColumns} rowKey={'id'} pagination={false} dataSource={items.map(item => item.commodity)} />
          </div>
        </div>
        <Records items={records} />
      </div>
    );
  }
}
export default View;
