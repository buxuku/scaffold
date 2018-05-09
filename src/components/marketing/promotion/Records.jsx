import React from 'react';
import { Table } from 'antd';

export default function Records(props) {
  const columns = [{
    title: '操作时间',
    className: 'g-td-left',
    dataIndex: 'createTime',
  }, {
    title: '操作人',
    className: 'g-td-left',
    dataIndex: 'operator',
  }, {
    title: '说明',
    className: 'g-td-left',
    dataIndex: 'remark',
    width: 392,
  }];
  return (
    <div className="g-mainbg" style={{ marginTop: '8px' }}>
      <h1 className="g-main-title">
        操作日志
      </h1>
      <div style={{ padding: '0 16px 35px' }}>
        <Table columns={columns} rowKey={'id'} pagination={false} dataSource={props.items} />
      </div>
    </div>
  );
}
