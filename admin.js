        var myApp = angular.module('myApp', ['ng-admin','ngRoute']);

        myApp.config(['NgAdminConfigurationProvider', function (nga) {
            var admin = nga.application('CourseApiTest Angular Backend')
                .baseApiUrl('http://vps249035.ovh.net/app_dev.php/api/'); // main API endpoint

            var user = nga.entity('user'); // the API endpoint for users will be 'http://jsonplaceholder.typicode.com/users/:id
            user.url(function(view, entityId) {
                //return 'user/' + (angular.isDefined(entityId) ? entityId : '');
                return 'user/';
            });
            user.listView()
                .fields([
                    nga.field('id').isDetailLink(true),
                    nga.field('firstname'),
                    nga.field('lastname'),
                    nga.field('gender')
                ]);
            user.creationView().fields([
                nga.field('firstname')
                    .validation({ required: true, minlength: 3, maxlength: 100 }),
                nga.field('lastname')
                    .validation({ required: true, minlength: 3, maxlength: 100 }),
                nga.field('gender', 'choice')
                    .choices([ // List the choice as object literals
                        { label: 'Male', value: 'm' },
                        { label: 'Female', value: 'f' }
                    ])
                    .attributes({ placeholder: 'Specify your gender (m or f)' })
            ]);
            user.editionView().fields(user.creationView().fields());
            admin.addEntity(user);

            var course = nga.entity('course'); // the API endpoint for users will be 'http://jsonplaceholder.typicode.com/users/:id
            course.url(function(view, entityId) {
                //return 'course/' + (angular.isDefined(entityId) ? entityId : '');
                return 'course/';
            });
            course.listView()
                .fields([
                    nga.field('id').isDetailLink(true),
                    nga.field('begin'),
                    nga.field('end'),
                    nga.field('title'),
                    nga.field('candidate_limit')
                ])
                .listActions(['show'])
                .batchActions([])
                ;
            course.showView().fields([
                nga.field('begin'),
                nga.field('end'),
                nga.field('title'),
                nga.field('candidate_limit')
            ]);
            course.creationView().fields([
                nga.field('begin', 'datetime'),
                nga.field('end', 'datetime'),
                nga.field('title'),
                nga.field('candidate_limit')
                    .validation({ required: true, minlength: 1, maxlength: 10 })
            ]);
            admin.addEntity(course);

            admin.menu(nga.menu()
                .addChild(nga.menu(user).icon('<span class="glyphicon glyphicon-user"></span>'))
                .addChild(nga.menu(course).icon('<span class="glyphicon glyphicon-pencil"></span>'))
            );

            nga.configure(admin);
        }]);

        myApp.config(['RestangularProvider', '$routeProvider', '$locationProvider', function (RestangularProvider, $routeParams, $locationProvider) {

            //Quick get method in javascript
            function getQuerystring(key, default_) {
                if (default_==null) default_="";
                key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
                var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
                var qs = regex.exec(window.location.href);
                if(qs == null) return default_; else return qs[1];
            }
            var token = getQuerystring('token');
            //console.log(token);
            //var token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXUyJ9.eyJleHAiOjE0NTgzOTk0NjUsInVzZXJuYW1lIjoiZWRvdWFyZG8iLCJpYXQiOiIxNDU4MzEzMDY1In0.jOHC1qN-QGIXh6I9YF2T8aum1QdHs4S0lAW-IBJpDGccd0AxnYjXSPO3pAo-hvUlfgCP50s8vV8woV59AW3hsiulwSDF8tEnz_Ty_x6l4Wfe0GgcINXhk_Uwn-ozZokSLjhRicheHWf4B2zp09BPCrVgBRnBcGwr9JjIY-rdIWu9qaQiimZ7U_6MkskRujLnmSeFN6nj9pDyxVCuKY-efodyvE6PwU60rTdACc3yuC8xBRB_p6aijKfiNpmRL_pULCFHRq9a9BVv-4sirhY8RbQFSAdjRH9vqXM4rHzBtYM7rvOSdcI1q4ctsnPgw2PjTapSLk_oezlFp14RvHfUS6LvJgkdVZcyBQ98lacrXg_vsUpeYwC-V5FoV4iyYzMWyCak2MzfP4N8BKRnMQPMX7uDtLRDzcnCUIAB76BnNRvcQJPoK3RWVxwGHRQQ2NpLvigqDlfLTPmES_7tXKp-oIvtJPRQh5uegk9zcLjzUKVzvv_ee0iq77VMIiK3c95DokGsl610HmTMiXhyFXpcPmy-C6w8jLnre47Yqjge4CoUsSIzSpBjKsrb3gsQM-xVpDw7K7hQyfyc6V0q0YAPhr_6UBon6Fpe5LS-UDUzc1AUonK0-cDwGxBBw_xy9nq3faYXzzhemrBaHBPw-vrFrzfDUz0APdJj-TnkWIvDpAg";

            RestangularProvider.setDefaultHeaders({
                'Authorization': 'Bearer ' + token
                //'withCredentials': true
            });

            RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
                if (operation == "getList") {
                    // custom pagination params
                    if (params._page) {
                        params._start = (params._page - 1) * params._perPage;
                        params._end = params._page * params._perPage;
                    }
                    delete params._page;
                    delete params._perPage;
                    // custom sort params
                    if (params._sortField) {
                        params._sort = params._sortField;
                        params._order = params._sortDir;
                        delete params._sortField;
                        delete params._sortDir;
                    }
                    // custom filters
                    if (params._filters) {
                        for (var filter in params._filters) {
                            params[filter] = params._filters[filter];
                        }
                        delete params._filters;
                    }
                }
                return { params: params };
            });
        }]);