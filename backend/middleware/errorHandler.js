const errorHandler = (err,req, res, next) => {
    const statusCode= res.statusCode ===200?500:res.statusCode
    res.status(statusCode);
    next(err);
};
module.exports=errorHandler;