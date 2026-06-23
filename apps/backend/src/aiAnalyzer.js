function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueSteps(steps) {
  return [...new Set(steps)];
}

function analyzeIncident({ incident, logs }) {
  const combinedText = normalizeText([
    incident.title,
    incident.description,
    incident.severity,
    incident.serviceName,
    ...logs.map((log) => `${log.logLevel} ${log.message}`),
  ].join(" "));

  const evidence = {
    database: hasAny(combinedText, [
      "database",
      "db",
      "postgres",
      "postgresql",
      "connection timeout",
      "connection refused",
      "too many connections",
      "db_host",
      "db_port",
      "db_password",
    ]),
    serverError: hasAny(combinedText, [
      "500",
      "internal server error",
      "exception",
      "stack trace",
      "unhandled",
    ]),
    frontendConnectivity: hasAny(combinedText, [
      "cors",
      "failed to fetch",
      "api url",
      "frontend",
      "browser",
      "network",
    ]),
    deployment: hasAny(combinedText, [
      "deployment",
      "release",
      "version",
      "rollback",
      "after deployment",
      "latest deployment",
    ]),
    severityCritical: normalizeText(incident.severity) === "critical",
  };

  let possibleRootCause = "Insufficient data. More logs, metrics, and deployment details are required.";
  let confidence = "low";
  let productionImpact = "Impact needs further validation based on affected users, error rate, and service dependency data.";

  const debuggingSteps = [
    "Check application health endpoint.",
    "Check readiness endpoint and dependency status.",
    "Review recent deployment or configuration changes.",
    "Check application logs for errors and stack traces.",
    "Verify service connectivity from caller to backend.",
  ];

  /*
    Priority matters:
    - Database timeout + 500 usually means DB dependency issue should be highlighted first.
    - Generic 500 is a symptom, not always the root cause.
    - Frontend connectivity/CORS has a different debugging path.
  */
  if (evidence.database) {
    possibleRootCause = "Possible database connectivity, timeout, or PostgreSQL performance issue.";
    confidence = evidence.serverError ? "high" : "medium";
    productionImpact = "Users may experience failed requests, slow responses, or incomplete incident workflows due to database dependency failure.";

    debuggingSteps.push(
      "Run pg_isready to verify PostgreSQL availability.",
      "Check PostgreSQL service status.",
      "Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD.",
      "Test database login using psql.",
      "Check database connection pool usage.",
      "Review PostgreSQL logs and slow queries.",
      "Check whether DB timeout started after deployment or config change."
    );
  } else if (evidence.frontendConnectivity) {
    possibleRootCause = "Possible frontend-backend connectivity, API URL, CORS, or network path issue.";
    confidence = "medium";
    productionImpact = "Frontend may load successfully but fail to display backend data or incident information.";

    debuggingSteps.push(
      "Check frontend API base URL.",
      "Open browser DevTools Network tab.",
      "Test backend directly using curl.",
      "Verify CORS response headers.",
      "Test OPTIONS preflight request.",
      "Check DNS, load balancer, ingress, or WSL/network path.",
      "Verify whether requests are visible in backend logs."
    );
  } else if (evidence.serverError) {
    possibleRootCause = "Application is returning server-side errors. Recent code change, dependency failure, or unhandled exception may be responsible.";
    confidence = "medium";
    productionImpact = "Users may see failed requests or broken workflows.";

    debuggingSteps.push(
      "Check backend logs around HTTP 500 timestamps.",
      "Search logs by requestId.",
      "Review recent commits and deployment version.",
      "Run the failing API locally if reproducible.",
      "Check whether errors started after latest deployment."
    );
  }

  if (evidence.serverError) {
    debuggingSteps.push(
      "Check backend logs around HTTP 500 timestamps.",
      "Search logs by requestId.",
      "Verify error rate and affected endpoints."
    );
  }

  if (evidence.deployment) {
    debuggingSteps.push(
      "Check deployment timestamp.",
      "Compare /version output across environments.",
      "Review CI/CD pipeline logs.",
      "Verify whether rollback target version is healthy."
    );
  }

  let rollbackRecommendation = "Rollback is not immediately recommended. Continue investigation and monitor service health.";

  if (evidence.severityCritical && evidence.deployment) {
    rollbackRecommendation = "Prepare rollback immediately. If the issue started after the latest deployment and customer impact is high, roll back to the last stable version after confirming rollback safety.";
  } else if (evidence.deployment) {
    rollbackRecommendation = "Compare incident start time with latest deployment. If the issue started after deployment and impact is increasing, rollback should be considered.";
  } else if (evidence.severityCritical) {
    rollbackRecommendation = "Prepare a rollback plan, but confirm whether the issue is deployment-related before executing rollback.";
  }

  const summary = `Incident '${incident.title}' affecting service '${incident.serviceName}' with severity '${incident.severity}'. Based on available evidence, ${possibleRootCause}`;

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
    "Confidence:",
    confidence,
    "",
    "Impact:",
    productionImpact,
    "",
    "Resolution:",
    "Resolution should be updated after the fix is verified.",
    "",
    "Preventive Actions:",
    "- Improve monitoring and alerting.",
    "- Add/verify readiness checks for dependencies.",
    "- Improve deployment verification.",
    "- Document debugging steps in runbook.",
    "- Add automated smoke tests for critical flows.",
  ].join("\n");

  return {
    summary,
    possibleRootCause,
    confidence,
    debuggingSteps: uniqueSteps(debuggingSteps),
    rollbackRecommendation,
    productionImpact,
    postmortemDraft,
  };
}

module.exports = {
  analyzeIncident,
};
