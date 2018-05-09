import React from 'react';
import { Link } from 'react-router-dom';
import { Table, DatePicker, Button, Select, Modal, Input, message, Icon } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { GoBack, SearchPanel, NetUitl } from 'gui';
import qs from 'query-string';
import { paramsDate } from '../../../common/tools';

const { RangePicker } = DatePicker;
const Option = Select.Option;
const TextArea = Input.TextArea;
class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {
        pageSize: 10,
        currentPage: 1,
        status: '-1',
      },
      searchKey: qs.parse(this.props.location.search).searchText || null,
    };
  }
  componentDidMount() {
    this.initList(
      Object.assign(
        {},
        this.state.params,
        qs.parse(this.props.location.search),
      ),
    );
  }
  componentWillReceiveProps(nextProps) {
    this.initList(
      Object.assign({}, this.state.params, qs.parse(nextProps.location.search)),
    );
  }
  initList = (params) => {
    const newParams = _.clone(params);
    if (newParams.status === '-1') {
      delete newParams.status;
    } else {
      newParams.status = +newParams.status;
    }
    NetUitl.get('/api/v1/promotions', newParams, (res) => {
      this.setState({
        ...res.data,
        params,
      });
    });
  };
  doSearch = (value) => {
    const params = this.state.params;
    params.searchText = value;
    params.currentPage = 1;
    this.props.history.push({
      pathname: '/promotion',
      search: qs.stringify(params),
    });
  };
  handlePage = (pagination) => {
    const params = this.state.params;
    params.currentPage = pagination.current;
    this.props.history.push({
      pathname: '/promotion',
      search: qs.stringify(params),
    });
  };
  handleSelect = (value) => {
    const params = this.state.params;
    params.currentPage = 1;
    params.status = value;
    this.props.history.push({
      pathname: '/promotion',
      search: qs.stringify(params),
    });
  }
  handleDate = (date, dateString) => {
    const params = paramsDate(this.state.params, dateString);
    params.currentPage = 1;
    this.props.history.push({
      pathname: '/promotion',
      search: qs.stringify(params),
    });
  };
  handleStart = (row) => {
    Modal.confirm({
      title: '立即启动特价活动',
      content: (<div>立即启用后，商品销售价格将执行“活动价格”
      </div>),
      okText: '确定',
      cancelText: '返回',
      width: 416,
      onOk: () => {
        NetUitl.post(`/api/v1/promotions/${row.id}/enable`, {}, (res) => {
          if (res.status === 10200) {
            message.success(res.msg);
            const items = this.state.items;
            const index = _.findIndex(items, { id: row.id });
            items[index].statusDesc = '进行中';
            items[index].status = 1;
            this.setState({
              items,
            });
          } else {
            message.error(res.msg);
          }
        });
      },
    });
  }
  handleCancelModal = () => {
    this.setState({
      cancelVisible: false,
      disableRemark: '',
    });
  }
  handleCancel = (row) => {
    this.setState({
      row,
      cancelVisible: true,
    });
  }
  handleStop = () => {
    NetUitl.post(`/api/v1/promotions/${this.state.row.id}/disable?disableRemark=${this.state.disableRemark}`, {}, (res) => {
      if (res.status === 10200) {
        message.success(res.msg);
        const items = this.state.items;
        const index = _.findIndex(items, { id: this.state.row.id });
        items[index].statusDesc = '已停用';
        items[index].status = 2;
        this.setState({
          items,
          cancelVisible: false,
          disableRemark: '',
        });
      } else {
        message.error(res.msg);
      }
    });
  }
  render() {
    function getAction(row, comm) {
      let actionDom;
      switch (row.status) {
        case 0:
          actionDom = <div><button onClick={() => comm.handleStart(row)} className="g-button-link" style={{ padding: '0', margin: '0 16px 0 0' }}>启用</button><Link to={`/promotion/edit/${row.id}`}>编辑</Link></div>;
          break;
        case 1:
          actionDom = <div><button onClick={() => comm.handleCancel(row)} className="g-button-link" style={{ padding: '0', margin: '0 16px 0 0' }}>停用</button><Link to={`/promotion/view/${row.id}`}>查看</Link></div>;
          break;
        default:
          actionDom = <div><Link to={`/promotion/view/${row.id}`}>查看</Link></div>;
      }
      return actionDom;
    }
    const columns = [{
      title: '活动名称',
      dataIndex: 'name',
      className: 'g-td-left',
      width: 220,
    }, {
      title: '开始时间',
      dataIndex: 'startTime',
      className: 'g-td-left',
      width: 180,
    }, {
      title: '结束时间',
      dataIndex: 'endTime',
      className: 'g-td-left',
      width: 180,
      render: value => value || '长期有效',
    }, {
      title: '创建账号',
      dataIndex: 'creator',
      className: 'g-td-left',
      width: 160,
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      className: 'g-td-right',
      width: 180,
    }, {
      title: '定时启动',
      dataIndex: 'auto',
      className: 'g-td-right',
      width: 88,
      render: value => (value ? '是' : '否'),
    }, {
      title: '活动状态',
      dataIndex: 'statusDesc',
      className: 'g-td-right',
      width: 88,
    }, {
      title: '操作',
      className: 'g-td-right',
      key: 'action',
      render: (value, row) => getAction(row, this),
    }];
    const preUrl = localStorage.preUrl;
    const rangePickerProps = {
      onChange: this.handleDate,
      value: null,
    };
    const params = this.state.params;
    if (params.startTime && params.endTime) {
      rangePickerProps.value = [moment(params.startTime), moment(params.endTime)];
    }
    const pagination = {
      current: this.state.currentPage,
      total: this.state.totalCount,
    };
    return (<div className="g-mainbg" style={{ position: 'relative' }}>
      <h1 className="g-main-title g-title-line">特价活动列表</h1>
      <div className="g-actions-link" style={{ top: '16px', right: '16px' }}>
        <GoBack route={preUrl} />
        <Link to="/promotion/add"><Button type="primary">创建特价活动</Button></Link>
      </div>
      <div style={{ padding: '24px 16px 18px' }}>
        活动开始时间: <RangePicker className={rangePickerProps.value ? '' : 'g-no-separator'} {...rangePickerProps} placeholder={['区间筛选', '']} />
        <div style={{ display: 'inline-block', marginLeft: '40px' }}>
          活动状态: <Select
            style={{ width: '160px' }}
            value={this.state.params.status.toString()}
            onChange={this.handleSelect}
          >
            <Option key="-1">全部</Option>
            <Option key="0">待启动</Option>
            <Option key="1">进行中</Option>
            <Option key="2">已停用</Option>
            <Option key="3">已取消</Option>
            <Option key="4">已结束</Option>
          </Select>
        </div>
        <SearchPanel
          value={this.state.searchKey}
          style={{ float: 'right', width: '348px' }}
          placeholder="请输入活动名称查询"
          onChange={value => this.setState({ searchKey: value.target.value })}
          onSearch={value => this.doSearch(value)}
        />
      </div>
      <Table
        pagination={pagination}
        onChange={this.handlePage}
        columns={columns}
        rowKey="id"
        dataSource={this.state.items}
      />
      <Modal
        visible={this.state.cancelVisible}
        title={<span><Icon style={{ color: '#FAAD14', marginRight: '16px' }} type="exclamation-circle" />立即停用特价活动</span>}
        onCancel={this.handleCancelModal}
        footer={[
          <Button key="back" onClick={this.handleCancelModal}>
            取消
          </Button>,
          <Button
            key="submit"
            disabled={!this.state.disableRemark}
            type="primary"
            onClick={this.handleStop}
          >
            确定
          </Button>,
        ]}
      >
        <TextArea
          maxLength={100}
          onChange={value => this.setState({ disableRemark: value.target.value })}
          value={this.state.disableRemark}
          style={{ width: '530px', height: '168px' }}
          placeholder="立即停用后，商品销售价格将执行“该呀价”。停用特价活动须填写停用原因，最多支持100字符"
        />
      </Modal>
    </div>);
  }
}
export default List;
