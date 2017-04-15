/*
 * Copyright 2015 - 2017 Anton Tananaev (anton@traccar.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('Traccar.view.DevicesStates', {
    extend: 'Ext.grid.Panel',
    xtype: 'devicesStatesView',

    requires: [
        'Ext.grid.filters.Filters',
        'Traccar.AttributeFormatter',
        'Traccar.view.DevicesStatesController'
    ],

    controller: 'devicesStates',

    plugins: 'gridfilters',

    store: 'VisibleDevices',

    stateful: true,
    stateId: 'devices-grid',

    initComponent: function () {

        var devicesStore = Ext.getStore('Devices');
        var positionsStore = Ext.getStore('Positions');

        var me = this;

        devicesStore.load(function () {
            positionsStore.load(function () {

                console.log(devicesStore.getCount());
                console.log(positionsStore.getCount());

                var datas = [];
                devicesStore.each(function (record, id) {
                    //console.log(record.data);
                    var dt = record.data;
                    dt.did = dt.id ;
                    var dt2 = positionsStore.findRecord('deviceId' , dt.id)

                    if(dt2){
                        datas.push(Object.assign(dt, dt2.data));
                    }else{
                        datas.push(dt);
                    }
                });

                console.log(datas);
                var store = {
                    fields: ['did', 'name', 'status', 'id', 'protocol', 'deviceId', 'serverTime', 'deviceTime', 'fixTime', 'valid', 'accuracy', 'latitude', 'longitude', 'altitude', 'speed', 'speedConverted', 'course', 'address', 'distanceConverted', 'attributes'],
                    data: datas
                };

                var columns = [
                    { header: 'Device Id', dataIndex: 'did', flex: 1 },
                    { header: 'Device Name', dataIndex: 'name', flex: 1 },
                    { header: 'Device Status', dataIndex: 'status', flex: 1 },
                    { header: 'Server Time', dataIndex: 'serverTime', flex: 1 },
                    { header: 'Accuracy', dataIndex: 'accuracy', flex: 1 },
                    { header: 'Latitude', dataIndex: 'latitude', flex: 1 },
                    { header: 'Longitude', dataIndex: 'longitude', flex: 1 },
                    { header: 'Altitude', dataIndex: 'altitude', flex: 1 },
                    { header: 'Address', dataIndex: 'address', flex: 1 },
                    { header: 'Speed', dataIndex: 'speed', flex: 1 },
                    { header: 'Distance Covered', dataIndex: 'distanceConverted', flex: 1 },

                ];

                 me.reconfigure(store, columns)

            })
        });





        this.callParent(arguments);
    },

    tbar: {
        componentCls: 'toolbar-header-style',
        items: [{
            xtype: 'tbtext',
            html: Strings.deviceTitle,
            baseCls: 'x-panel-header-title-default'
        }, {
            xtype: 'tbfill'
        }, {
            xtype: 'button',
            disabled: true,
            handler: 'onAddClick',
            reference: 'toolbarAddButton',
            glyph: 'xf067@FontAwesome',
            tooltip: Strings.sharedAdd,
            tooltipType: 'title'
        },  {
              disabled: false,
              handler: 'onMapClick',
              reference: 'deviceCommandButton',
              glyph : 'X',
              tooltip: "maps",
              tooltipType: 'title'
       }]
    },

    listeners: {
        selectionchange: 'onSelectionChange'
    },

    viewConfig: {
        getRowClass: function (record) {
            var status = record.get('status');
            if (status) {
                return Ext.getStore('DeviceStatuses').getById(status).get('color');
            }
        }
    },

    columns: {
        defaults: {
            flex: 1,
            minWidth: Traccar.Style.columnWidthNormal
        },
        items: [{
            text: Strings.sharedName,
            dataIndex: 'name',
            filter: 'string'
        }, {
            text: Strings.deviceIdentifier,
            dataIndex: 'uniqueId',
            hidden: false
        }, {
            text: Strings.sharedPhone,
            dataIndex: 'phone',
            hidden: false
        }, {
            text: Strings.deviceModel,
            dataIndex: 'model',
            hidden: false
        }, {
            text: Strings.deviceContact,
            dataIndex: 'contact',
            hidden: false
        }, {
            text: Strings.groupDialog,
            dataIndex: 'groupId',
            hidden: true,
            filter: {
                type: 'list',
                labelField: 'name',
                store: 'Groups'
            },
            renderer: function (value) {
                var group;
                if (value !== 0) {
                    group = Ext.getStore('Groups').getById(value);
                    return group ? group.get('name') : value;
                }
            }
        }, {
            text: Strings.deviceStatus,
            dataIndex: 'status',
            filter: {
                type: 'list',
                labelField: 'name',
                store: 'DeviceStatuses'
            },
            renderer: function (value, metaData) {
                var status;
                if (value) {
                    status = Ext.getStore('DeviceStatuses').getById(value);
                    if (status) {
                        return status.get('name');
                    }
                }
            }
        }, {
            text: Strings.deviceLastUpdate,
            dataIndex: 'lastUpdate',
            renderer: function (value, metaData, record) {
                var seconds, interval;

                if (value) {
                    seconds = Math.floor((new Date() - value) / 1000);
                    interval = Math.floor(seconds / 86400);
                    if (interval > 1) {
                        return interval + ' ' + Strings.sharedDays;
                    }
                    interval = Math.floor(seconds / 3600);
                    if (interval > 1) {
                        return interval + ' ' + Strings.sharedHours;
                    }
                    return Math.floor(seconds / 60) + ' ' + Strings.sharedMinutes;
                }
            }
        }]
    }
});
