export const errorHandler = (error, _, res, next)=> {
    console.error(error.stack || error);
    res.status(error.statusCode || 500).json({
        message: error.message || "Something went wrong! Please try after some time.",
        data: null,
        success: false,
    })

    next();
}