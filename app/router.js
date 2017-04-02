import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {});
Router.map(function() {
  this.route('about');
  this.route('leaderboard');
  this.route('contacts');
  this.route('resources');
  this.route('main_page');
});

export default Router;
