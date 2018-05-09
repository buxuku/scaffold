import React from 'react';
import { Table, Button } from 'antd';
import { GoBack, SearchPanel, NetUitl } from 'gui';
import CardPanel from './CardPanel';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      params: {
        pageSize: 10,
        currentPage: 1,
      },
    };
  }
  componentDidMount() {
    this.initList(this.state.params);
  }
  initList = (params) => {
    NetUitl.get(`/api/v1/promotions/${this.props.match.params.id}/sales_record`, params, (res) => {
      this.setState({
        ...res.data,
        params,
      });
    });
  }
  doSearch = (value) => {
    const params = this.state.params;
    params.searchText = value;
    params.currentPage = 1;
    this.initList(params);
  };
  handlePage = (pagination) => {
    const params = this.state.params;
    params.currentPage = pagination.current;
    this.initList(params);
  };
  handleExport = () => {
    const a = document.createElement('a');
    a.href = `/api/v1/export/excel/promotions/${this.props.match.params.id}`;
    document.body.appendChild(a);
    a.click();
  }
  render() {
    const columns = [{
      title: '商品货号',
      dataIndex: 'articleNumber',
      width: 240,
      className: 'g-td-left',
      render: (value, row) => `[${row.articleNumber}]${value}`,
    }, {
      title: '商品名称',
      dataIndex: 'name',
      width: 288,
      className: 'g-td-left',
    }, {
      title: '该呀价(元)',
      dataIndex: 'price',
      className: 'g-td-left',
    }, {
      title: '活动价(元)',
      dataIndex: 'promotionPrice',
      className: 'g-td-left',
    }, {
      title: '购买数量(件)',
      className: 'g-td-left',
      dataIndex: 'salesAmount',
    }, {
      title: '购买金额(元)',
      className: 'g-td-left',
      dataIndex: 'totalSalesMoney',
    }];
    const pagination = {
      current: this.state.currentPage,
      total: this.state.totalCount,
    };
    const info = this.props.location.state;
    const showSearch = false;
    return (<div className="g-mainbg" style={{ position: 'relative' }}>
      <div className="g-actions-link" style={{ top: '16px', right: '16px' }}>
        <GoBack />
      </div>
      <div style={{ padding: '16px' }}>
        <CardPanel info={info} />
        <div style={{ marginTop: '16px', position: 'relative' }}>
          <h1 className="g-main-title">商品销售列表</h1>
          {showSearch &&<SearchPanel
            value={this.state.searchKey}
            style={{ position: 'absolute', right: '106px', top: '16px', width: '348px' }}
            placeholder="请输入商品货号、商品名称"
            onChange={value => this.setState({ searchKey: value.target.value })}
            onSearch={value => this.doSearch(value)}
          />}
          <Button onClick={this.handleExport} style={{ position: 'absolute', right: '0', top: '16px' }} type="primary">导出数据</Button>
          <Table
            pagination={pagination}
            onChange={this.handlePage}
            columns={columns}
            dataSource={this.state.items}
          />
        </div>
      </div>
    </div>);
  }
}
export default List;
