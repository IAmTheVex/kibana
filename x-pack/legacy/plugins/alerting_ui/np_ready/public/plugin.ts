/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { unmountComponentAtNode } from 'react-dom';
import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from 'src/core/public';
import { i18n } from '@kbn/i18n';
import routes from 'ui/routes';

import template from '../../public/index.html';
import { renderReact } from './application';
import { BASE_PATH } from './application/constants';
import { breadcrumbService } from './application/lib/breadcrumb';
import { textService } from './application/lib/text';

export type Setup = void;
export type Start = void;

const REACT_ROOT_ID = 'alertingRoot';

export class ActionsPlugin implements Plugin<Setup, Start> {
  constructor(initializerContext: PluginInitializerContext) {}

  public setup(coreSetup: CoreSetup, pluginsSetup: any): Setup {
    /*
      The code below would be replacing for current:
      uiExports: {
        managementSections: ['myplugin/management'],
      }
    */
    const {
      management: { getSection },
    } = pluginsSetup;

    const kbnSection = getSection('kibana');
    kbnSection.register('alerting', {
      display: i18n.translate('xpack.alertingUI.managementSection.displayName', {
        defaultMessage: 'Alerting',
      }),
      order: 7,
      url: `#${BASE_PATH}`,
    });
  }

  public start(coreStart: CoreStart, pluginsStart: any) {
    textService.init(i18n);
    breadcrumbService.init(coreStart.chrome, pluginsStart.management.breadcrumb);

    const unmountReactApp = (): void => {
      const elem = document.getElementById(REACT_ROOT_ID);
      if (elem) {
        unmountComponentAtNode(elem);
      }
    };

    routes.when(`${BASE_PATH}/:section?/:subsection?/:view?/:id?`, {
      template,
      controller: (() => {
        return ($route: any, $scope: any) => {
          const appRoute = $route.current;
          const stopListeningForLocationChange = $scope.$on('$locationChangeSuccess', () => {
            const currentRoute = $route.current;
            const isNavigationInApp = currentRoute.$$route.template === appRoute.$$route.template;

            // When we navigate within SR, prevent Angular from re-matching the route and rebuild the app
            if (isNavigationInApp) {
              $route.current = appRoute;
            } else {
              // Any clean up when user leaves SR
            }

            $scope.$on('$destroy', () => {
              if (stopListeningForLocationChange) {
                stopListeningForLocationChange();
              }
              unmountReactApp();
            });
          });

          $scope.$$postDigest(() => {
            unmountReactApp();
            const elReactRoot = document.getElementById(REACT_ROOT_ID);
            if (elReactRoot) {
              renderReact(elReactRoot, coreStart, pluginsStart);
            }
          });
        };
      })(),
    });
  }

  public stop() {}
}