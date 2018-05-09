import qs from 'query-string';
import _ from 'lodash';

const order = {
  ascend: 'ASC',
  descend: 'DESC',
  ASC: 'ascend',
  DESC: 'descend',
};

export const assignParams = (pre, next) => {
  const query = qs.parse(pre);
  const params = Object.assign({}, next, query);
  return params;
};

export const pathHistory = (com, path, query) => {
  com.props.history.push({
    pathname: path,
    search: qs.stringify(query),
  });
};

export const paramsDate = (params, dateString) => {
  const cloneParams = _.cloneDeep(params);
  cloneParams.startTime = dateString[0] ? `${dateString[0]} 00:00:00` : '';
  cloneParams.endTime = dateString[1] ? `${dateString[1]} 23:59:59` : '';
  return cloneParams;
};

export const sorterParams = (pagination, oldParams, sorter) => {
  const orderStatus = order[sorter.order];
  const params = oldParams;
  if (
    sorter.columnKey &&
    (params.sortField !== sorter.columnKey || params.sort !== orderStatus)
  ) {
    params.currentPage = 1;
    params.sortField = sorter.columnKey;
    params.sort = orderStatus;
  } else {
    params.currentPage = pagination.current;
  }
  return params;
};

export const sorterStatus = sorter => order[sorter];
