import React from 'react';
import { Form, Icon, Button, Radio, Input, Popover, Modal, message } from 'antd';
import { GoBack, NetUitl } from 'gui';
import moment from 'moment';
import GoodsSelectTable from './GoodsSelectTable';
import DateRange from '../../../common/DateRange';
import StatusTag from '../../../common/StatusTag';
import ImportGoods from '../../../common/ImportGoods';
import Records from './Records';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      records: [],
      removedItems: [],
    };
    this.isEdit = !!this.props.match.params.id;
  }
  componentDidMount() {
    const form = this.props.form;
    if (this.isEdit) {
      NetUitl.get(`/api/v1/promotions/${this.props.match.params.id}`, {}, (res) => {
        const data = res.data;
        form.setFieldsValue({
          dataRange: {
            startTime: data.startTime,
            endTime: data.endTime,
          },
          name: data.name,
          auto: data.auto,
          remark: data.remark,
        });
        this.setState({
          items: data.items.map((item) => {
            const i = item.commodity;
            i.dbId = item.id;
            return i;
          }),
          records: data.records,
        });
      });
    }
  }
  confirm = () => {
    Modal.confirm({
      title: '批量设置供货商促销分润',
      content: (<div>
        <p style={{ fontSize: '12px', color: '#A0A9B6', marginBottom: '40px' }}>“促销分润”不能大于“供货商原始分润”</p>
        <div>促销分润:
          <Input
            onChange={value => this.setState({ batchInput: value.target.value })}
            style={{ width: '224px' }}
            placeholder="请输入"
          />
        </div>
      </div>),
      okText: '确认',
      cancelText: '取消',
      width: 416,
      onOk: () => {
        this.setState({
          batchPromotionPrice: this.state.batchInput,
        });
      },
    });
  }
  handleCancelSubmit = () => {
    NetUitl.post(`/api/v1/promotions/${this.props.match.params.id}/cancel?disableRemark=${this.state.disableRemark}`, {}, (res) => {
      if (res.status === 10200) {
        message.success(res.msg);
        this.props.history.goBack();
      } else {
        message.error(res.msg);
      }
    });
  }
  handleGoodsResult = (value, removedItems = null) => {
    this.setState({
      items: value,
    });
    if (removedItems) {
      this.setState({
        removedItems,
      });
    }
  }
  handleSubmit = () => {
    const form = this.props.form;
    form.validateFieldsAndScroll(
      { scroll: { offsetTop: 84 } },
      (err, values) => {
        if (!err) {
          if (this.state.items.some(item =>
            !item.promotionPrice || item.promotionPrice > item.price)) {
            this.setState({
              hasError: true,
            });
            return;
          }
          const data = values;
          data.items = this.state.items.map((item) => {
            const obj = {
              commodity: item,
            };
            if (item.dbId) {
              obj.id = item.dbId;
            }
            return obj;
          });
          data.startTime = values.dataRange.startTime;
          data.endTime = values.dataRange.endTime;
          if (this.isEdit) {
            data.id = +this.props.match.params.id;
            NetUitl.put('/api/v1/promotions', data, (res) => {
              this.submitResult(res);
            });
          } else {
            NetUitl.post('/api/v1/promotions', data, (res) => {
              this.submitResult(res);
            });
          }
        }
      });
  }
  submitResult = (res) => {
    if (res.status === 10200) {
      message.success(res.msg, 3, () => { this.props.history.goBack(); });
    } else {
      message.error(res.msg);
    }
  }
  handleImportResult = (items) => {
    this.setState({
      items: [...this.state.items, ...items],
    });
  }
  checkDataRange = (rule, value, callback) => {
    if (!value || !value.startTime) {
      callback('开始时间必选');
    } else if (value.startTime
      && value.endTime
      && moment(value.endTime).diff(moment(value.startTime), 'hours') < 24) {
      callback('时间间隔不能小于24小时');
    } else {
      callback();
    }
  };
  handleCancelModal = () => {
    this.setState({
      cancelVisible: false,
      disableRemark: '',
    });
  }
  handleCancel = () => {
    this.setState({
      cancelVisible: true,
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 2,
        },
      },
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 20,
        },
      },
    };
    const content = (
      <div className="g-promotion-rules">
        <p><Icon type="exclamation-circle" style={{ color: '#FAAD14', margin: '0 8px' }} />注意！</p>
        <p>营销成本是由活动发放方承担成本。供货商的销售分成，按活动期间 的分成计算。</p>
        <ul>
          <li>GAIA平台的分成按活动前价格计算</li>
          <li>店铺的销售分成按活动前价格计算</li>
        </ul>
      </div>
    );
    return (
      <div>
        <div className="g-mainbg g-top-line" style={{ position: 'relative', paddingBottom: '4px' }}>
          <h1 className="g-main-title">活动信息
            <Popover content={content} placement="rightTop" trigger="hover"><div style={{ display: 'inline-block' }}><StatusTag type="notice" title="使用说明" /></div></Popover>
          </h1>
          <div className="g-actions-link" style={{ top: '16px', right: '16px' }}>
            <GoBack />
          </div>
          <Form layout="horizontal">
            <FormItem {...formItemLayout} label="活动名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    min: 3,
                    max: 20,
                    required: true,
                    message: '活动名称为3-20个中文字符',
                  }, {
                    pattern: '^[\u4e00-\u9fa5_a-zA-Z0-9\\s]+$',
                    message: '不能包含符号',
                  },
                ],
              })(<Input placeholder="限3-20个中文字符，请设置" style={{ width: '224px' }} />)}
              <span className="g-form-notice">仅在特价列表中展示</span>
            </FormItem>
            <FormItem {...formItemLayout} label="定时启动">
              {getFieldDecorator('auto', {
                rules: [
                  {
                    required: true,
                    message: '定时启动必选',
                  },
                ],
              })(
                <RadioGroup>
                  <Radio value>是</Radio>
                  <Radio value={false}>否</Radio>
                </RadioGroup>)}
              <span className="g-form-notice">选择“是”表示开始时间达到自动启用，选择“否”表示开始时间达到必需手动启用</span>
            </FormItem>
            <FormItem {...formItemLayout} label="活动有效期">
              {getFieldDecorator('dataRange', {
                rules: [
                  {
                    required: true,
                    message: '活动有效期必选',
                  },
                  {
                    validator: this.checkDataRange,
                  },
                ],
              })(<DateRange />)}
              <span className="g-form-notice">“开始时间”须设置，“结束时间”不设置表示长期有效</span>
            </FormItem>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark')(<TextArea maxLength={100} style={{ width: '376px', height: '96px' }} placeholder="请输入备注信息，最多支持100字符" />)}
            </FormItem>
          </Form>
        </div>
        <div className="g-mainbg" style={{ marginTop: '8px', postion: 'relative' }}>
          <h1 className="g-main-title">商品信息
            <span className="g-title-notice"> <Icon type="exclamation-circle" style={{ color: '#FAAD14', margin: '0 8px' }} />若商品已经关联“特价活动”，且“特价活动”状态处于“待启动”、“进行中”不可被关联</span>
          </h1>
          <div className="g-actions-link" style={{ top: '16px', right: '16px' }}>
            <ImportGoods
              items={this.state.items}
              onResult={this.handleImportResult}
              removedItems={this.state.removedItems}
            />
            <Button onClick={this.confirm}>批量设置促销分润</Button>
          </div>
          <div style={{ width: '1167px', margin: '0 auto', paddingBottom: '58px' }}>
            <GoodsSelectTable
              batchPromotionPrice={this.state.batchPromotionPrice}
              onResult={this.handleGoodsResult}
              items={this.state.items}
              check={this.state.hasError}
            />
          </div>
        </div>
        <div className="g-mainbg" style={{ marginTop: '8px', postion: 'relative', textAlign: 'right', padding: '16px' }}>
          {this.isEdit && <Button onClick={this.handleCancel} style={{ marginRight: '16px' }}>取消</Button>}
          <Button disabled={!this.state.items.length} onClick={this.handleSubmit} type="primary">{this.isEdit ? '编辑' : '创建活动'}</Button>
        </div>
        {this.isEdit && <Records items={this.state.records} />}
        <Modal
          visible={this.state.cancelVisible}
          title={<span><Icon style={{ color: '#FAAD14', marginRight: '16px' }} type="exclamation-circle" />确定要取消特价活动吗？</span>}
          onCancel={this.handleCancelModal}
          footer={[
            <Button key="back" onClick={this.handleCancelModal}>
              取消
            </Button>,
            <Button
              key="submit"
              disabled={!this.state.disableRemark}
              type="primary"
              onClick={this.handleCancelSubmit}
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
            placeholder="取消后不可撤回。取消特价活动须填写取消原因，最多支持100字符"
          />
        </Modal>
      </div>
    );
  }
}
const AddWrapper = Form.create()(Add);
export default AddWrapper;

