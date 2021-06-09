// https://myst729.github.io/posts/2013/two-solutions-for-point-in-polygon-problem/

/**
 * @description 射线法判断点是否在多边形内部
 * @param {Object} p 待判断的点，格式：[x,y] 
 * @param {Array} poly 多边形顶点，数组成员的格式同 p
 * @return {String} 点 p 和多边形 poly 的几何关系
 */
function rayCasting(p, poly) {
    var px = p[0],
        py = p[1],
        flag = false

    for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sx = poly[i][0],
            sy = poly[i][1],
            tx = poly[j][0],
            ty = poly[j][1]

        // 点与多边形顶点重合
        if ((sx === px && sy === py) || (tx === px && ty === py)) {
            return 'on'
        }

        // 判断线段两端点是否在射线两侧
        if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
            // 线段上与射线 Y 坐标相同的点的 X 坐标
            var x = sx + (py - sy) * (tx - sx) / (ty - sy)

            // 点在多边形的边上
            if (x === px) {
                return 'on'
            }

            // 射线穿过多边形的边界
            if (x > px) {
                flag = !flag
            }
        }
    }

    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? true : false
}

let point = []
let polygon = []
point = [13, 15]
polygon = [
    [7, 20],
    [20, 20],
    [20, 10],
    [7, 10]
]

console.log('点:', point, '面：', polygon)
console.log('是否在：', rayCasting(point, polygon))
console.log('----------------------------------')


point = [25, 10]
polygon = [
    [7, 20],
    [20, 20],
    [20, 10],
    [7, 10]
]

console.log('点:', point, '面：', polygon)
console.log('是否在：', rayCasting(point, polygon))

console.log('----------------------------------')

point = [10, 10]
polygon = [
    [0, 0],
    [5, 5],
    [10, 6],
    [16, 7],
    [21, 6],
    [22, 1],
    [23, 15],
    [16, 14],
    [2, 6]
]

console.log('点:', point, '面：', polygon)
console.log('是否在：', rayCasting(point, polygon))

console.log('----------------------------------')
point = [14, 6]
console.log('点:', point, '面：', polygon)
console.log('是否在：', rayCasting(point, polygon))