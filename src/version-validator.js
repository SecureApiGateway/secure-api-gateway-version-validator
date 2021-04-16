const core   = require('@actions/core');
const semver = require('semver');
const yaml   = require('js-yaml');
const fs     = require('fs')

const inputs = () => {
  return {
    chartPath: core.getInput('chartPath', { required: true }),
    binaryVersion: core.getInput('binaryVersion', { required: true }),
  }
}

function loadYamlFile(path) {
  try {
    return yaml.load(fs.readFileSync(path), 'utf8')
  } catch(e) {
    core.error(e)
    core.setFailed(e)
  }
}

function writeFile(path, content) {
  fs.writeFileSync(path, yaml.dump(content), (err) => {
    if (err) {
      core.error(err)
      core.setFailed(err)
    }
  });
}

const run = async () => {
  const {chartPath, binaryVersion} = inputs()
  
  chart = loadYamlFile(chartPath)
  updatedChart = updateChart(chartPath, chart, binaryVersion)

  if (updatedChart) {
    core.setOutput("isUpdatedChart", true)
  } else {
    core.setOutput("isUpdatedChart", false)
  }

  if (semver.satisfies(binaryVersion, 'x.x.x') && !updatedChart) {
    core.info("Valid Release detected.")
    core.setOutput("isRelease", true)
  } else {
    core.setOutput("isRelease", false)
  }
}

const updateChart = (chartPath, chart, binaryVersion) => {
  core.info(`Chart appVersion: ${chart.appVersion}`)
  core.info(`Helm version: ${chart.version}`)
  core.info(`Binary version: ${binaryVersion}`)
  if (chart.appVersion != binaryVersion) {
    core.info("Chart appVersion does not match binary version. Synchronising appVersion...")
    chart.appVersion = binaryVersion
    chart.version = semver.valid(semver.coerce(binaryVersion))
    writeFile(chartPath, chart)
    return true
  }
  core.info("Chart appVersion matches binary version. Nothing to do")
  return false
}

module.exports = {run, updateChart, loadYamlFile, writeFile}