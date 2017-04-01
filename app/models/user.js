import DS from 'ember-data';

export default DS.Model.extend({
    user: DS.attr('string'),
    mph: DS.attr('number'),
    __v: DS.attr('number')
});
