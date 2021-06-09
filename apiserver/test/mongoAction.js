function MongoAction(actionModel) {
    this.actionModel = actionModel
}
MongoAction.prototype.save = function(data) {
    return new Promise((resolve, reject) => {
        this.actionModel.create(data, (err, docs) => {
            if (err) {
                rejct(err);
            } else {
                resolve(docs);
            }
        })
    })
};
MongoAction.prototype.find = function(data = {}, fields = null, options = {}) {
    return new Promise((resolve, reject) => {
        //model.find(需要查找的对象(如果为空，则查找到所有数据), 属性过滤对象[可选参数], options[可选参数], callback)
        this.actionModel.find(data, fields, options, (error, doc) => {
            if (error) {
                reject(error)
            } else {
                resolve(doc)
            }
        })
    })
};
MongoAction.prototype.findOne = function(data) {
    return new Promise((resolve, reject) => {
        //model.findOne(需要查找的对象,callback)
        this.actionModel.findOne(data, (error, doc) => {
            if (error) {
                reject(error)
            } else {
                resolve(doc)
            }
        })
    })
};
MongoAction.prototype.findById = function(data) {
    return new Promise((resolve, reject) => {
        //model.findById(需要查找的id对象 ,callback)
        this.actionModel.findById(data, (error, doc) => {
            if (error) {
                reject(error)
            } else {
                resolve(doc)
            }
        })
    })
};
MongoAction.prototype.update = function(conditions, update) {
    return new Promise((resolve, reject) => {
        //model.update(查询条件,更新对象,callback)
        this.actionModel.update(conditions, update, (error, doc) => {
            if (error) {
                reject(error)
            } else {
                resolve(doc)
            }
        })
    })
};
MongoAction.prototype.remove = function(conditions) {
    return new Promise((resolve, reject) => {
        //model.update(查询条件,callback)
        this.actionModel.remove(conditions, (error, doc) => {
            if (error) {
                reject(error)
            } else {
                resolve(doc)
            }
        })
    })
}


module.exports = MongoAction;