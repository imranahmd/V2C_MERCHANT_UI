export const camelize = (str: string) => {
  return str.replace(/\W+(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
}

export const camelToTile = (str: string) => {
  const result = str.replace(/([A-Z])/g, " $1").trim()
    .replace(/Payment|Payments|Payment/g, "Payments")
    .replace(/U D F/g, "UDF")
    .replace(/R R N/g, "RRN")
    .replace(/M D R/g, "MDR")
    .replace(/U T R/g, "UTR")
    .replace(/G S T/g, "GST")
    .replace(/B Q R/g, "BQR")
    .replace(/P A N/g, "PAN")
    .replace(/Ip/g, "IP")
    .replace(/R O D T/g, "RODT")
    .replace(/I D|I d|Id/g, "ID");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
