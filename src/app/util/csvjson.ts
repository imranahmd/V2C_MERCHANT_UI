export const csvToJson = (csvText: string | undefined): any[]=>{
  if (!csvText) {
    return []
  }
  let lines: any[] = [];
  const linesArray = csvText.split('\n');
  // for trimming and deleting extra space
  linesArray.forEach((e: any) => {
    const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
    lines.push(row);
  });
  // for removing empty record
  // lines.splice(lines.length - 1, 1);
  const result = [];
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {

    const obj = {};
    const currentLine = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
      // @ts-ignore
      obj[headers[j]] = currentLine[j];
    }
    result.push(obj);
  }
  return result;
}

export const jsonToCsv = (JSONData: any, ReportTitle?: any, ShowLabel?: any) => {
  let index;
  let row;
  const arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

  let CSV = '';

  if(ReportTitle)
    CSV += ReportTitle + '\r\n\n';

  if (ShowLabel) {
    row = "";

    //This loop will extract the label from 1st index of on array
    for (index in arrData[0]) {

      //Now convert each value to string and comma-seprated
      row += index + ',';
    }

    row = row.slice(0, -1);

    //append Label row with line break
    CSV += row + '\r\n';
  }

  //1st loop is to extract each row
  for (let i = 0; i < arrData.length; i++) {
    row = "";

    //2nd loop will extract each column and convert it in string comma-seprated
    for (index in arrData[i]) {
      row += '"' + arrData[i][index] + '",';
    }

    row.slice(0, row.length - 1);

    //add a line break after each row
    CSV += row + '\r\n';
  }

  if (CSV == '') {
    return '';
  }else {
    return CSV
  }
}
