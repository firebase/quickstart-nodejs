// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const clc = require('cli-color');
const Mocha = require('mocha');

const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

/**
 * A simple custom Mocha reporter to make test output digestible 
 * for codelab purposes.
 */
class SimpleReporter {
  constructor(runner) {
    this._indents = 0;
    const stats = runner.stats;

    runner
      .on(EVENT_SUITE_BEGIN, (suite) => {
        if (suite.total() > 0) {
          console.log(clc.bold.white(suite.title));
        }
        this.increaseIndent();
      })
      .on(EVENT_SUITE_END, () => {
        this.decreaseIndent();
      })
      .on(EVENT_TEST_PASS, test => {
        console.log(`${this.indent()}${clc.bold.green('✓')} ${test.title}`);
      })
      .on(EVENT_TEST_PENDING, test => {
        console.log(`${this.indent()}${clc.bold.blue('?')} ${test.title}`);
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        console.log(`${this.indent()}${clc.bold.red('✗')} ${test.title}`);
        this.increaseIndent();
        console.log(this.indentMultilineString(`${clc.red(err.message.trim())}`));
        this.decreaseIndent();
      })
      .once(EVENT_RUN_END, () => {
        console.log();
        if (stats.passes > 0) {
          console.log(`${clc.bold.green('✓ Passed')}: ${stats.passes}`);
        }
        if (stats.pending > 0) {
          console.log(`${clc.bold.blue('? Pending')}: ${stats.pending}`);
        }
        if (stats.failures > 0) {
          console.log(`${clc.bold.red('✗ Failed')}: ${stats.failures}`);
        }
        console.log();
        console.log(`${clc.bold.yellow('Duration')}: ${stats.duration}ms`)
      });
  }

  indent() {
    return Array(this._indents).join('  ');
  }

  increaseIndent() {
    this._indents++;
  }

  decreaseIndent() {
    this._indents--;
  }

  indentMultilineString(msg) {
    const lines = msg.split('\n');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = this.indent() + lines[i];
    }

    return lines.join('\n');
  }
}

module.exports = SimpleReporter;