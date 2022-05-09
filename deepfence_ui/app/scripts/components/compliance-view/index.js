/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Link, withRouter, Redirect } from 'react-router-dom';
import SideNavigation from '../common/side-navigation/side-navigation';
import HeaderView from '../common/header-view/header-view';
import {
  ADMIN_SIDE_NAV_MENU_COLLECTION,
  USER_SIDE_NAV_MENU_COLLECTION,
  COMPLIANCE_TILES_COLLECTION
} from '../../constants/menu-collection';


import { getUserRole } from '../../helpers/auth-helper';

export const ComplianceViewHome = withRouter((match) => {

  const tiles = COMPLIANCE_TILES_COLLECTION;
  const sideNavMenuCollection =
    getUserRole() === 'admin'
      ? ADMIN_SIDE_NAV_MENU_COLLECTION
      : USER_SIDE_NAV_MENU_COLLECTION;

  const isSideNavCollapsed = useSelector(state =>
    state.get('isSideNavCollapsed')
  );
  const [activeMenu] = useState(sideNavMenuCollection[0]);


  const renderScripts = () => {
    return (
      <div>
        <Route
          exact
          path={`${match.match.path}/:cloudType`}
          render={({ match: matchCloudType }) => {
            const Comp = tiles.find((tile) => tile.name === matchCloudType.params.cloudType)?.component;
            if (Comp) {
              return <Comp />;
            }
            return <Redirect to={`${match.match.path}`} />
          }}
        />
      </div>
    )
  }


  const Rendertiles = () => {
    const tab = [];
    tiles.forEach(tabDetails => {
      tab.push(
        <div className="tab-container " >
          <div className="integration-box" title={tabDetails.displayName}>
            {tabDetails.icon &&
              <div className="integration-logo" style={{ backgroundColor: tabDetails.bgcolor }}> <img className="img-fluid p-2" src={tabDetails.icon} /></div>}
            {tabDetails.iconClassName && <span className={tabDetails.iconClassName} />}
            <div style={{ marginTop: '100px' }}>
              <Link to={`${match.match.path}/${tabDetails.name}`}>
                <button type="button" className="btn-configure-integration">
                  {tabDetails.displayName}
                </button>
              </Link>
            </div>
          </div>
        </div>
      )
    })
    return tab;
  }

  return (
    <div>
      <SideNavigation
        navMenuCollection={sideNavMenuCollection}
        activeMenu={activeMenu}
      />
      <div className="protection-polices-view-wrapper">
        <HeaderView />
      </div>
      <div className="">
        <div
          className={`notifications-container ${isSideNavCollapsed ? 'collapse-side-nav' : 'expand-side-nav'
            }`}
        >
          <div style={{ marginTop: '53px' }}>
            <div className="chart-wrapper">
              <div className="integration-container">
                <div className="tabs-content-wrapper">
                  {renderScripts()}
                  <Route
                    exact
                    path={`${match.match.path}`}
                    render={() => (
                      <Rendertiles />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});