/**
 * 服务controller的方法
 */

exports.validationError = function(res, err) {
  return res.status(422).json(err);
};




// /**
//  * Change a users password
//  */
// exports.changePassword = function(req, res, next) {
//   var userId = req.user._id;
//   var oldPass = String(req.body.oldPassword);
//   var newPass = String(req.body.newPassword);

//   Admin.findById(userId, function (err, user) {
//     if(user.authenticate(oldPass)) {
//       user.password = newPass;
//       user.save(function(err) {
//         if (err) return adminService.validationError(res, err);
//         res.send(200);
//       });
//     } else {
//       res.send(403);
//     }
//   });
// };



// /**
//  * Get my info
//  */
// exports.me = function(req, res, next) {
//   var userId = req.user._id;
//   Admin.findOne({
//     _id: userId
//   }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
//     if (err) return next(err);
//     if (!user) return res.json(401);
//     res.json(user);
//   });
// };
