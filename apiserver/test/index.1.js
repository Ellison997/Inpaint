let topicModel = require('../models/topic');
let ObjectID = require('mongodb').ObjectID;
let concernModel = require('../models/concern');

let topicData = {
    userId: 'hhhhhhhh',
    title: '这是标题',
    text: '这是内容',
    images: ['1111', '2222', '3333', '4444']
}

async function aaa() {
    try {
        // let topic = new topicModel(topicData)
        // console.log('实例化后的', topic, topic.toJSON())
        // let saveRes = await topic.save()
        // console.log('添加的返回', saveRes)


        // let findRes = await topicModel.find()
        // for (const f of findRes) {
        //     console.log('查询的返回', f.toJSON())
        // }

        let aa = await concernModel.deleteOne({ _id: ObjectID('5f07454e52502d3de85b8170') })
        console.log('删除一个的返回', aa)


        // let findByIdRes = await topicModel.findById('5ef8ba84ad7a725f3493edf0')
        // console.log('根据ID查询的返回', findByIdRes)
        // let findOneRes = await topicModel.findOne();
        // console.log('查找一个的返回', findOneRes)


        // let updateRes = await topicModel.update()
        // console.log('更新的返回', updateRes)
        // let removeRes = await topic.remove()
        // console.log('删除的返回', removeRes)
    } catch (error) {
        console.log('错误了哦', error)
    }
}

aaa()