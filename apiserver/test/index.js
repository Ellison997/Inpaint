let mongoAction = require('./mongoAction')
let topicModel = require('../models/topic');

let topicData = {
    name: '15',
    name1: '16',
    name2: '17',
    name3: '18',
}

let topic = new mongoAction(topicModel)

async function aaa() {
    try {
        console.log('实例化后的', topic)
        let saveRes = await topic.save(topicData)
        console.log('添加的返回', saveRes)

        let findRes = await topic.find()
        console.log('查询的返回', findRes)

        let findByIdRes = await topic.findById('5ef300a51578a645d482cb9b')
        console.log('根据ID查询的返回', findByIdRes)
        let findOneRes = await topic.findOne();
        console.log('查找一个的返回', findOneRes)


        let updateRes = await topic.update()
        console.log('更新的返回', updateRes)
        let removeRes = await topic.remove()
        console.log('删除的返回', removeRes)
    } catch (error) {
        console.log('错误了哦', error)
    }
}

aaa()