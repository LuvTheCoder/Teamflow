function errorHandler(err, req, res, next) {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        message: statusCode == 500 ? "Something went wrong" : err.message
    })
}

module.exports = errorHandler;