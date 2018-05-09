import React from 'react';

export default function StatusTag(props) {
  return (
    <span className={`g-status-tag g-status-tag-${props.type}`}>
      {props.title}
    </span>
  );
}
