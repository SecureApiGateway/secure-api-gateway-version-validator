const assert = require('chai').assert
const expect = require('chai').expect
require('mocha-sinon');
const action = require('../src/version-validator')
const fs = require('fs')
const os = require('os')

const readChartPath = 'tests/Chart.yaml'
const writeChartPath = 'testChart.yaml'

//Set github action input env var for testing
const setInput = (name,value)=>
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]=value;

describe('chart test', () => {

  beforeEach(function() {
    this.sinon.stub(process.stdout, 'write');
  });

  afterEach(function() {
    process.stdout.write.restore();
    try {
      fs.unlinkSync(writeChartPath);
    } catch(e) {
      // file might not exist to delete which is fine
    }
  });

  it('should not update if binary version matches appVersion', async () => {
    chart = {
      version: "0.0.1",
      appVersion: "0.0.1"
    }
    binaryVersion = "0.0.1"
    updated = action.updateChart(writeChartPath, chart, binaryVersion)
    assert.isFalse(fs.existsSync(writeChartPath))

    assert.isFalse(updated)
  });

  it('should load the helm chart yaml', () => {
    file = action.loadYamlFile(readChartPath)

    assert.equal(file.apiVersion, "v2")
  })

  it('should update appVersion and version if new snapshot', () => {
    chart = {
      version: "0.0.1",
      appVersion: "0.0.1"
    }
    binaryVersion = "0.0.2-SNAPSHOT"
    updated = action.updateChart(writeChartPath, chart, binaryVersion)

    assert.isTrue(updated)
    assert.isTrue(fs.existsSync(writeChartPath))

    file = action.loadYamlFile(writeChartPath)

    assert.equal(file.appVersion, binaryVersion)
    assert.equal(file.version, "0.0.2")
  });

  it('should not set release if helm version changes with a binary snapshot', function() {
    chart = {
      version: "0.0.1",
      appVersion: "0.0.1"
    }
    binaryVersion = "0.0.2-SNAPSHOT"

    action.writeFile(writeChartPath, chart)
    assert.isTrue(fs.existsSync(writeChartPath))

    setInput("chartPath", writeChartPath)
    setInput("binaryVersion", binaryVersion)

    action.run()

    expect( process.stdout.write.calledWith('::set-output name=isRelease::false' + os.EOL) ).to.be.true;
    expect( process.stdout.write.calledWith('::set-output name=isUpdatedChart::true' + os.EOL) ).to.be.true;

  });

  it('should not set release if binary version is semver compliant but binary version does not match appVersion', function() {
    chart = {
      version: "0.0.1",
      appVersion: "0.0.1"
    }
    binaryVersion = "0.0.2"

    action.writeFile(writeChartPath, chart)
    assert.isTrue(fs.existsSync(writeChartPath))

    setInput("chartPath", writeChartPath)
    setInput("binaryVersion", binaryVersion)

    action.run()

    expect( process.stdout.write.calledWith('::set-output name=isRelease::false' + os.EOL) ).to.be.true;
    expect( process.stdout.write.calledWith('::set-output name=isUpdatedChart::true' + os.EOL) ).to.be.true;

  });

  it('should set release if binary version is semver compliant and appVersion matches binaryVersion', function() {
    chart = {
      version: "0.0.1",
      appVersion: "0.0.2"
    }
    binaryVersion = "0.0.2"

    action.writeFile(writeChartPath, chart)
    assert.isTrue(fs.existsSync(writeChartPath))

    setInput("chartPath", writeChartPath)
    setInput("binaryVersion", binaryVersion)

    action.run()

    // isUpdated = process.stdout.write.getCall(5).args[0];

    expect( process.stdout.write.calledWith('::set-output name=isRelease::true' + os.EOL) ).to.be.true;
    expect( process.stdout.write.calledWith('::set-output name=isUpdatedChart::false' + os.EOL) ).to.be.true;
  });
});