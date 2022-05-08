import React from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import Loader from '../loader';
import ComplianceTestCategoryReport from './test-category-report';

const loaderStyle = {
  top: '50%',
};

class ComplianceTestCategoryReportContainer extends React.PureComponent {
  render() {
    const {
      reportView, nodeId, checkType, ...rest
    } = this.props;
    const hostReport = reportView && reportView.get(nodeId) || Map();
    const checkTypeReport = hostReport.get(checkType) || Map();
    const data = checkTypeReport && checkTypeReport.get('report') || [];
    const initiatedByPollable = checkTypeReport.get('initiatedByPollable');
    const loading = checkTypeReport.get('loading') && !initiatedByPollable;
    const emptyData = data.length === 0 && !loading;
    return (
      <div>
        {loading && data.length === 0
          && (
          <Loader
            small
            style={loaderStyle}
          />
          )
        }
        {emptyData
          && (
          <div className="absolute-center">
            No Data Available
          </div>
          )}
        <div className="cis-title">Compliance scan summary</div>
        <ComplianceTestCategoryReport
          data={data}
          nodeId={nodeId}
          checkType={checkType}
          {...rest}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  reportView: state.getIn(['compliance', 'test_category_report_view']),
  globalSearchQuery: state.get('globalSearchQuery')
});

export default connect(mapStateToProps)(ComplianceTestCategoryReportContainer);
