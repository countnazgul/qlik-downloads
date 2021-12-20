export function extractRelease(releaseName: string): {
  qRelease: string;
  qReleaseType: string;
  qIndex: string;
} {
  const reg = new RegExp(
    /((\b\d{1,2}\D{0,3})?\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(Nov|Dec)(?:ember)?)\D?)(\d{1,2}(st|nd|rd|th)?)?((\s*[,.\-\/]\s*)\D?)?\s*((19[0-9]\d|20\d{2})|\d{2})/
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const init = releaseName.match(reg);
  if (!init) return { qRelease: releaseName, qReleaseType: "", qIndex: "-1" };
  if (init.length == 0)
    return { qRelease: releaseName, qReleaseType: "", qIndex: "-1" };

  let patch = releaseName.replace(init[0], "").replace("Patch", "").trim();
  let patchString = patch.length == 1 ? `0${patch}` : patch;
  patchString = patch == "IR" ? `00` : patchString;

  const initSplit = init[0].split(" ");
  let monthId = months.indexOf(initSplit[0]) + 1;
  let monthIdString = monthId < 10 ? `0${monthId}` : monthId;

  const index = `${initSplit[1]}${monthIdString}${patchString}`;

  return {
    qRelease: init[0],
    qReleaseType: patch == "IR" ? "0" : patch,
    qIndex: index,
  };
}

export const productsList = [
  "Qlik Fortress Installer",
  "Qlik Alerting for Windows",
  "Qlik NPrinting",
  "Qlik Catalog",
  "Qlik Replicate",
  "Qlik Compose",
  "Qlik Connector for use with SAP NetWeaver®",
  "Qlik Lineage Connector",
  "Qlik Essbase Connector",
  "Qlik Salesforce Connector",
  "Qlik ODBC Connector",
  "Qlik REST Connector",
  "Qlik Web Connectors",
  "Qlik GeoAnalytics Data Package",
  "Qlik GeoAnalytics Plus",
  "Qlik GeoAnalytics Server",
  "Qlik GeoAnalytics For QlikView",
  "Qlik GeoAnalytics For Qlik Sense",
  "QlikView IE plug-in",
  "QlikView OCX",
  "QlikView Workbench",
  "QlikView Governance Dashboard",
  "QlikView Object Migration for Cloud",
  "QlikView Desktop",
  "QlikView Server",
  "Qlik Sense Desktop",
  "Qlik Sense Server",
];
