interface String {
  prefix(pre: string): string;
  interpolate(pre: string): any;
}

String.prototype.prefix = function (pre: string) {
  return pre + this;
};

String.prototype.interpolate = function(params: any) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  // console.log(names, vals, "********-->");
  // console.log(new Function(...names, `return \`${this}\`;`)(...vals), "********-->");
  return new Function(...names, `return \`${this}\`;`)(...vals);
}
