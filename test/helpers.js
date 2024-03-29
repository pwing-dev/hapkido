const config      = require('config');
const mongoose    = require('mongoose');
const mockgoose   = require('mockgoose');
const Application = require('requirefrom')('server/models')('application');

// helpers.js will be run as a test case, too, before any other test in
// the subdirectories. So this can be used to set up the global environment.
// And even if it wasn't run: The first test to require this file would
// also trigger the setup.
before(function(done) {
  // keeps the config object mutable
  process.env['ALLOW_CONFIG_MUTATIONS'] = true;
  // sets up a mock database
  mongoose.Promise = Promise;
  mockgoose(mongoose).then(() => {
    mongoose.connect(config.mongo);
    done();
  }, done);
});

configApi = {
  isImmutable: () => { const desc = Object.getOwnPropertyDescriptor(config, 'get'); return desc && !desc.writable; },
  isSetupForTesting: () => { try { config.get(null, true); return true; } catch(e) { return false; } },
  setTempValue: (key, value) => {
    //~ console.log('CONFIG: set ' + key + ': ' + value);
    if (!configApi.isSetupForTesting()) {
      if (configApi.isImmutable()) {
        throw new Error('Cannot alter the config object any more');
      }
      const temps = {};
      const oldGet = config.get;
      config.get = (key, returnTemps) => {
        let val;
        if (returnTemps) {
          val = temps;
        } else if (temps.hasOwnProperty(key)) {
          val = temps[key];
        } else {
          val = oldGet.call(config, key);
        }
        //~ if (!returnTemps)
          //~ console.log('CONFIG: get ' + key + ': ' + val);
        return val;
      };
    }
    const temps = config.get(null, true);
    temps[key] = value;
  },
  unsetTempValue: key => {
    if (configApi.isSetupForTesting()) {
      const temps = config.get(null, true);
      delete temps[key];
    }
  },
  unsetAllTempValues: () => {
    if (configApi.isSetupForTesting()) {
      const temps = config.get(null, true);
      for (let key of Object.keys(temps)) {
        delete temps[key];
      }
    }
  }
};

module.exports = {
  config: configApi,
  disableLogging: () => {
    configApi.setTempValue('logging.enabled', false);
  },
  grecaptchaTestMode: () => {
    configApi.setTempValue('recaptcha.site_key', '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
    configApi.setTempValue('recaptcha.secret_key', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe');
    const captchaResponse =
      '03AHJ_VuvX91Xbl1YlYf093zCTiyYCzBxbzfUxcbFm3aNr3tDjYLWGrTxgJKm6' +
      '2gThGu74QSs-JEzq4XTTpBVdjwEhaIMJUsbl2Utes8Df6DbAhJGQE_QkpNR3yT' +
      'v10FTndzssZkqQAEKf7Q_Jwu3AGDNPekEV7ljU75HGTsHoXcncBlGUHwydn9wR' +
      '3TmN8bOteYQLdgRCs8UKpOy4__IBcDK3zv651d35Ybf1aoudXbnGRI7eaucGnj' +
      'Vp7ZvEDDgDlHnrj4KLTm6tnU14cLPDDqDZBIADvhcDi6y6b7xxik5PSN-k6POg' +
      '3EJd3la5mQh-Z2LWWCjVm8naulG0e0U6qt18JPgcodTquy6AVqgLcpkc33U2sI' +
      'Q5ssiqkKQjmbXwMUnICtxanBUOZfs_N-cL86IfS97MfPLJule2z5ZikDu3uOav' +
      'BwFGQ4O8TXI2_amlDhyqE0sxtZ5xnn3YxfAe3Ps6PlIU-r93-7RFp8227mXEo8' +
      'ElG3lWp_8K1_Ak8nejS8ex0YZEGukZ2183PWL4ddGOnd6dzuotxZTO6SnRfF46' +
      'Ae9RuBS5NCTPkOrbqr9QdgYQUv04OW-f3mO0nCl7dHdniu1Wbd4kTno0c7PL4E' +
      'Vm8rEhlUni8jT07y2TN1C8sV0cdtrRoQamlU5qnH6ED_3S5lBmJBky9QlV5x48' +
      'PFs_Ez1f6hQit4YmM55JlXcyqqv8SuTW_0ObQ7N5oFH8NmvCUnev6StY5aiIT_' +
      'W7AI_j7VDVCKdpIwIcWYIPpEYykYgDNAIkWo-7RuWBP_MAnas2BW0IXk-rHXVZ' +
      'izm8yzAk3PaydMJe-bCxT1EW7kcO65wHkP5tuh6YDPTbqD2RMVSk125yAsXSCw' +
      'RIIHEngw4_UvMJVSNVtPAkCSsYh7euJUvY0NqEUDPVUR1dc8izpaP__TLtb_xQ' +
      'FRFXzMq_uT6pWrerUJOrcecHFjVaz-OEKm038XstG25gVwSmUfDaUJ7bIoCPHp' +
      'BEgKlp0hnyR4-ujT5DMp_hE5g';
    return captchaResponse;
  },
  unmockgoose: done => {
    if (mongoose.isMocked) {
      mockgoose.reset(done);
    }
  },
  app: {
    promiseSetupComplete: () => new Promise((resolve, reject) =>
      Application.setSetupComplete(err => {
        if (err) reject();
        else resolve();
      })
    ),
    promiseAppStateReloaded: () => new Promise((resolve, reject) => 
      Application._forceReload(err => {
        if (err) reject();
        else resolve();
      })
    )
  }
};
