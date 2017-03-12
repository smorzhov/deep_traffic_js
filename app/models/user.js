import DS from 'ember-data';

export default DS.Model.extend({
    rank: DS.attr('number'),
    name: DS.attr('string'),
    speed: DS.attr('number')
});
