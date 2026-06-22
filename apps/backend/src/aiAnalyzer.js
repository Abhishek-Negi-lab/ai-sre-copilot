function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function analyzeIncident({ incident, logs }) {
  const combinedText = normalizeText([
    incident.title,
    incident.description,
    incident.severity,
    incident.serviceName,
    ...logs.map((log) => `${log.logLevel} ${log.message}`),
  ].join(" "));

  let possibleRootCause = "Insufficient data. More logs, metrics, and deployment details are required.";
  let confidence = "low";
  let rollbackRecommendation = "Rollback is not immediately recommended. Continue investigation and monitor service health.";
  let productionImpact = "Impact needs further validation based on affected users, error rate, and service dependency data.";

  const debuggingSteps = [
    "Check application health endpoint.",
    "Check readiness endpoint and dependency status.",
    "Review recent deployment or configuration changes.",
    "Check application logs for errors and stack traces.",
    "Verify service connectivity from caller to backend.",
  ];

  if (combinedText.includes("database") || combinedText.includes("db") || combinedText.includes("postgres") || combinedText.includes("timeout")) {
    possibleRootCause = "Possible database connectivity or database performance issue.";
    confidence = "medium";
    productionImpact = "Users may experience failed requests, slow responses, or incomplete incident data due to database dependency issues.";
    debuggingSteps.push(
      "Run pg_isready to verify PostgreSQL availability.",
      "Check database credentials and environment variables.",
      "Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.",
      "Check database connection pool usage.",
      "Review PostgreSQL logs and slow queries."
    );
  }

  if (combinedText.includes("500") || combinedText.includes("internal server error") || combinedText.includes("exception")) {
    possibleRootCause = "Application is returning server-side errors. Recent code change, dependency failure, or unhandled exception may be responsible.";
    confidence = confidence === "medium" ? "high" : "medium";
    productionImpact = "Users may see failed requests or broken workflows.";
    debuggingSteps.push(
      "Check backend logs around HTTP 500 timestamps.",
      "Search logs by requestId.",
      "Review recent commits and deployment version.",
      "Run the failing API locally if reproducible.",
      "Check whether errors started after latest deployment."
    );
  }

  if (combinedText.includes("cors") || combinedText.includes("failed to fetch") || combinedText.includes("api url")) {
    possibleRootCause = "Possible frontend-backend connectivity or API URL configuration issue.";
    confidence = "medium";
    productionImpact = "Frontend may load successfully but fail to display backend data.";
    debuggingSteps.push(
      "Check frontend API base URL.",
      "Open browser DevTools Network tab.",
      "Test backend directly using curl.",
      "Verify CORS response headers.",
      "Check DNS, load balancer, ingress, or WSL/network path."
    );
  }

  if (combinedText.includes("critical") || incident.severity === "critical") {
    rollbackRecommendation = "Prepare rollback immediately. If error rate or customer impact is high, roll back to the last stable version after confirming deployment correlation.";
    confidence = confidence === "low" ? "medium" : confidence;
  }

  if (combinedText.includes("deployment") || combinedText.includes("release") || combinedText.includes("version")) {
    rollbackRecommendation = "Compare incident start time with latest deployment. If issue started after deployment and impact is high, rollback should be considered.";
    debuggingSteps.push(
      "Check deployment timestamp.",
      "Compare /version output across environments.",
      "Review CI/CD pipeline logs.",
      "Verify whether rollback target version is healthy."
    );
  }

  const summary = `Incident '${incident.title}' affecting service '${incident.serviceName}' with severity '${incident.severity}'. Based on available logs and description, ${possibleRootCause}`;

  const postmortemDraft = [
    `Title: ${incident.title}`,
    `Service: ${incident.serviceName}`,
    `Severity: ${incident.severity}`,
    "",
    "Summary:",
    summary,
    "",
    "Possible Root Cause:",
    possibleRootCause,
    "",
    "Impact:",
    productionImpact,
    "",
    "Resolution:",
    "Resolution should be updated after the fix is verified.",
    "",
    "Preventive Actions:",
    "- Improve monitoring and alerting.",
    "- Add/verify readiness checks.",
    "- Improve deployment verification.",
    "- Document debugging steps in runbook.",
  ].join("\\n");

  return {
    summary,
    possibleRootCause,
    confidence,
    debuggingSteps,
    rollbackRecommendation,
    productionImpact,
    postmortemDraft,
  };
}

module.exports = {
  analyzeIncident,
};
