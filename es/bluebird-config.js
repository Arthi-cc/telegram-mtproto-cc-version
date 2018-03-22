import Bluebird from 'bluebird';

//$FlowIssue
Bluebird.config({
  warnings: {
    wForgottenReturn: false
  },
  longStackTraces: true,
  cancellation: true,
  monitoring: false
});
//# sourceMappingURL=bluebird-config.js.map