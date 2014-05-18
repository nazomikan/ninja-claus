// likely RFC 4122
module.exports = function(){
  var crs
    ;

  // create random string
  crs = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  return (crs() + crs() + "-" + crs() + "-" + crs() + "-" + crs() + "-" + crs() + crs() + crs());
}
