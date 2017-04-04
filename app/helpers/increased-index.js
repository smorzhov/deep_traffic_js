import Ember from 'ember';

export function increasedIndex(index) {
  return parseInt(index) + 1;
}

export default Ember.Helper.helper(increasedIndex);
