import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
    namespace: 'api',
    host: 'http://deep-traffic-server.azurewebsites.net'
});
