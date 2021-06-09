let xml2js = require('xml2js');
let parser = new xml2js.Parser();   //xml -> json
let builder = new xml2js.Builder();  // JSON->xml

let xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
// xml 转json
parser.parseString(xml, function (err, result) {
    console.dir(JSON.stringify(result));
});

// json 转xml
let json = {
    name: 'JSON',
    array: [
        {
            $: {
                'Class': 'Object'
            },
            index: '1111',
            name: '哈哈哈1111'
        },
        {
            index: '2222',
            name: '哈哈哈2222'
        }
    ]
}
let xml2 = builder.buildObject(json)
console.log(xml2)

// https://www.npmjs.com/package/xml2js