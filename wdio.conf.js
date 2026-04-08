
export const config = {

  runner: "local",

  specs: [
    "./tests/**/*.e2e.js"
  ],

  maxInstances: 1,

  capabilities: [{
    browserName: "chrome"
  }],

  logLevel: "error",

  framework: "mocha",

  mochaOpts: {
    ui: "bdd",
    timeout: 60000
  },

  services: [],

  port: 9515,

  baseUrl: "http://localhost:1420",

  waitforTimeout: 10000,

}
