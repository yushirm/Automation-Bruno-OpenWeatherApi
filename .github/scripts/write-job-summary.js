// Turns Bruno JSON reports into a GitHub job summary and failure annotations.
//
// Usage: node write-job-summary.js <report.json> [<report.json> ...]
//
// Bruno's JSON also holds request URLs, and those contain the API key in the appid query
// parameter. This script copies out only names, statuses and assertion messages, so never
// add a URL, header or response body to the output.
const fs = require("fs");

const reportPaths = process.argv.slice(2);

const requestResults = reportPaths.flatMap((reportPath) =>
  JSON.parse(fs.readFileSync(reportPath, "utf8")).flatMap((iteration) => iteration.results)
);

const testsOf = (requestResult) => [
  ...(requestResult.preRequestTestResults || []),
  ...(requestResult.testResults || []),
  ...(requestResult.postResponseTestResults || []),
];

const isTestFailed = (testResult) => testResult.status !== "pass";
const isRequestSkipped = (requestResult) => requestResult.status === "skipped";
const hasRequestFailed = (requestResult) =>
  requestResult.status === "error" || testsOf(requestResult).some(isTestFailed);

const allTests = requestResults.flatMap(testsOf);
const failedTests = allTests.filter(isTestFailed);
const failedRequestCount = requestResults.filter(hasRequestFailed).length;
const skippedRequestCount = requestResults.filter(isRequestSkipped).length;
const isRunPassing = failedRequestCount === 0 && skippedRequestCount === 0 && requestResults.length > 0;

const escapeTableCell = (text) => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
const requestLabel = (requestResult) => requestResult.path || requestResult.name;

const requestRows = requestResults.map((requestResult) => {
  const outcome = isRequestSkipped(requestResult) ? "⏭️" : hasRequestFailed(requestResult) ? "❌" : "✅";
  const httpStatus = requestResult.response && requestResult.response.status ? requestResult.response.status : "-";
  const tests = testsOf(requestResult);
  const passedCount = tests.filter((testResult) => !isTestFailed(testResult)).length;
  return `| ${outcome} | ${escapeTableCell(requestLabel(requestResult))} | ${httpStatus} | ${passedCount}/${tests.length} |`;
});

const failureLines = requestResults.flatMap((requestResult) =>
  testsOf(requestResult)
    .filter(isTestFailed)
    .map((testResult) => `- **${escapeTableCell(requestLabel(requestResult))}**: ${testResult.description}${testResult.error ? ` (${testResult.error})` : ""}`)
);

const summaryMarkdown = [
  `## ${isRunPassing ? "✅" : "❌"} Bruno results`,
  "",
  `**${requestResults.length} requests, ${allTests.length - failedTests.length} of ${allTests.length} tests passed**` +
    (skippedRequestCount ? `, ${skippedRequestCount} requests skipped` : ""),
  "",
  ...(failureLines.length ? ["### Failed tests", "", ...failureLines, ""] : []),
  "<details><summary>All requests</summary>",
  "",
  "| | Request | HTTP | Tests |",
  "|---|---|---|---|",
  ...requestRows,
  "",
  "</details>",
  "",
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
} else {
  process.stdout.write(summaryMarkdown);
}

// Workflow commands need these characters escaped to survive on one line.
const escapeAnnotationData = (text) => String(text).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeAnnotationProperty = (text) => escapeAnnotationData(text).replace(/:/g, "%3A").replace(/,/g, "%2C");

requestResults.forEach((requestResult) => {
  testsOf(requestResult).filter(isTestFailed).forEach((testResult) => {
    const file = escapeAnnotationProperty(`${requestLabel(requestResult)}.bru`);
    const title = escapeAnnotationProperty(testResult.description);
    process.stdout.write(`::error file=${file},title=${title}::${escapeAnnotationData(testResult.error || "Test failed")}\n`);
  });
});
