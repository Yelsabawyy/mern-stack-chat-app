const notFound = (req, res, next) => {
    console.log("req.path");
    console.log(req.path);
    console.log("Not Found path");
    const error=new Error('Not Found');
    res.status(404);
    next(error);
};
module.exports=notFound;