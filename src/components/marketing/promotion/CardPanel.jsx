import React from 'react';

export default function CardPanel(props) {
  const { name, startTime, endTime, auto } = props.info;
  return (
    <div className="g-card-panel">
      <div>
        <h3 className="g-card-panel-left">
          <span>活动名称:</span>{name}
        </h3>
      </div>
      <div className="g-card-panel-info">
        <div className="g-card-panel-left">
          <span>活动有效期:</span> {startTime}至{endTime || '长期有效'}
        </div>
        <div className="g-card-panel-right">
          <span>定期启动:</span>{auto ? '是' : '否'}
        </div>
      </div>
    </div>
  );
}
