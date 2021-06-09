let db = require('../common/mysql')

async function insert() {
    try {
        let data = await db.query(`select * from QUESTION  q where q.categoryId=1 ORDER BY sort limit 100 `, [])

        console.log('执行完了', data.length)
        for (const d in data) {
            await db.query(`insert into TEST_QUESTION(id,createTime,testPaperId,questionId,sort)
            values(uuid(),now(),'c39bb45d-8a62-11eb-a66a-0242ac110003',?,?)`, [data[d].id, d], 'insert')
        }
    } catch (error) {
        log.error(error)

    }
}
insert()