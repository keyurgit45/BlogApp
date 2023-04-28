// module.exports = (req, res, next) => {
//     return Promise.reject(next(req, res)).resolve()
// }

module.exports = (func) => (req , res, next) => {
    Promise.resolve(func(req, res, next)).catch(next)
}