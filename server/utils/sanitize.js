/**
 * @description 数据过滤中间件
 */

module.exports = function(req, res, next){

    if(req.query.startTime){
        req.query.startTime = Number(req.query.startTime);
    }

    if(req.query.endTime){
        req.query.endTime = Number(req.query.endTime);
    }

    if(req.query.page){
        req.query.page = Number(req.query.page);
    }

    if(req.query.count){
        req.query.count = Number(req.query.count);
    }else{
        req.query.count = DEFAULT_PAGE_COUNT;
    }

    next();
}