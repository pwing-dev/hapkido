const config      = require('config');
const mongoose    = require('mongoose');
const mockgoose   = require('mockgoose');
const Application = require('requirefrom')('server/models')('application');

module.exports = {
  disableLogging: () => {
    config.logging.enabled = false;
  },
  grecaptchaTestMode: () => {
    config.recaptcha = {
      site_key: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      secret_key: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    };
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
  setSetupComplete: Application.setSetupComplete,
  mockgoose: dummyConnect => {
    mongoose.Promise = Promise;
    return mockgoose(mongoose).then(
      () => {
        if (dummyConnect) {
          mongoose.connect(config.mongo);
        }
      }, err => Promise.reject(err)
    );
  },
  unmockgoose: () => {
    if (mongoose.isMocked) {
      mongoose.unmock();
    }
  }
};
