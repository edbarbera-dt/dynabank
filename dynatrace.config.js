module.exports = {
  react: {
    debug: true,

    lifecycle: {
      /**
       * Decide if you want to see Update Cycles as well
       */
      includeUpdate: false,

      /**
       * Filter for Instrumenting Lifecycle of Components / True = Will be instrumented
       */
      instrument: (filename) => {
        return false;
      },
    },

    input: {
      /**
       * Allows you to filter the instrumentation for touch events, refresh events and picker events in certain files
       * True = Will be instrumented
       */
      instrument: (filename) => {
        return true;
      },
    },
  },
  android: {
    // Those configs are copied 1:1
    config: `
        dynatrace {
            configurations {
                defaultConfig {
                    autoStart.enabled false
                    autoStart {
                        applicationId 'ab242b75-ce74-49f3-b4b4-45a5acdf042d'
                        beaconUrl 'https://bf52479mwb.bf-sprint.dynatracelabs.com/mbeacon'
                    }
                    userOptIn true
                    agentBehavior.startupLoadBalancing true
                    agentBehavior.startupWithGrailEnabled true

                }
            }
        }
        `,
  },
  ios: {
    // Those configs are copied 1:1
    config: `
        <key>DTXApplicationID</key>
        <string>ab242b75-ce74-49f3-b4b4-45a5acdf042d</string>
        <key>DTXBeaconURL</key>
        <string>https://bf52479mwb.bf-sprint.dynatracelabs.com/mbeacon</string>
        <key>DTXLogLevel</key>
        <string>ALL</string>
        <key>DTXUserOptIn</key>
        <true/>
        <key>DTXStartupLoadBalancing</key>
        <true/>
        <key>DTXStartupWithGrailEnabled</key>
        <true/>
        `,
  },
};

