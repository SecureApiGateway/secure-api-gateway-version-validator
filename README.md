# securebanking-version-validator

> A GitHub Action for comparing the binary version to the helm Chart version and determines if the service is ready for release

The helm chart `appVersion` should always match the service pom version. Eg if a pom version is 1.0.0-SNAPSHOT and the `appVersion` is 0.9.1 then the chart yaml will be changed to match the pom.

## Usage

```yaml
- uses: secureBankingAccessToolkit/securebanking-version-validator@master
  id: validator
  with:
    binaryVersion: "1.2.3-SNAPSHOT"
    chartPath: ./path/to/Chart.yaml
```

## inputs

| Argument | Description  | Required | 
| -------- | ------------ | -------- |
| binaryVersion | Version of binary. Eg. 1.2.3-SNAPSHOT | yes |
| chartPath     | relative path to the helm Chart.yaml  | yes |

## outputs

| argument       | description |
| -------------- | ----------- |
| isRelease      | returns true if the commit can be released. Eg. the binary version and appVersion are semver compliant |
| isUpdatedChart | returns true if the version validator has syncronised the Chart.yaml versions. This will be flagged if the binary version differs to the chart appVersion |
