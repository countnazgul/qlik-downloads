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

// export function sortArrayByTwoProperties(
//   array,
//   prop1,
//   asc1 = true,
//   prop2,
//   asc2 = true
// ) {
//   return array.sort(
//     (a, b) =>
//       (asc1 ? a[prop1] - b[prop1] : b[prop1] - a[prop1]) ||
//       (asc2 ? a[prop2] - b[prop2] : b[prop2] - a[prop2])
//   );
// }
