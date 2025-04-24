/**
 * 坐标
 * @row x坐标
 * @col y坐标
 * @f 最终用来评估的值 f = g+h       最终代价
 * @g 从起点到当前位置已经付出的代价    沉没成本
 * @h 当前点到终点的预计代价(只计算直线距离 并且无视障碍)
 */
export interface Point {
    row: number,
    col: number,
    f: number,
    g: number,
    h: number
}

/**
 * N叉树
 * @point  该点坐标
 * @child   孩子节点
 * @parent  父亲节点
 */
export interface treeNode {
    point: Point,
    children: Array<treeNode>,
    parent?: treeNode
}

/**
 * 地图信息
 * @map:地图分布
 * @start 地图起点位置
 * @end 地图终点位置
 */
export interface MapObject{
    map:Array<Array<number|boolean>>,
    start:{
        x:number,
        y:number
    },
    end:{
        x:number,
        y:number
    }
}

/**
 * 8个方向上的枚举
 */
export enum dirent {
    p_up,
    p_down,
    p_left,
    p_right,
    p_lup,
    p_ldown,
    p_rup,
    p_rdown
}

export const createPoint = (row: number, col: number): Point => {
    return {
        row,
        col,
        f: 0,
        g: 0,
        h: 0
    }
}

export const createTreeNode = (row: number, col: number): treeNode => {
    return {
        point: createPoint(row, col),
        children: []
    }
}

/**
 * 判断两个Point是否相等
 * @param a 第一个Point
 * @param b 第二个Point
 * @returns 如果两个Point相等，则返回true，否则返回false
 */
function arePointsEqual(a: Point, b: Point): boolean {
    return a.row === b.row &&
        a.col === b.col &&
        a.f === b.f &&
        a.g === b.g &&
        a.h === b.h;
}

/**
 * 判断两个treeNode是否相等
 * @param a 第一个treeNode
 * @param b 第二个treeNode
 * @returns 如果两个treeNode相等，则返回true，否则返回false
 */
export function areTreeNodesEqual(a: treeNode, b: treeNode): boolean {
    // 首先检查point对象是否相等
    if (!arePointsEqual(a.point, b.point)) {
        return false;
    }

    // 检查children数组的长度是否相等
    if (a.children.length !== b.children.length) {
        return false;
    }

    // 遍历a的children数组，并检查每个对应的b.children中的元素是否相等
    for (let i = 0; i < a.children.length; i++) {
        if (!areTreeNodesEqual(a.children[i], b.children[i])) {
            return false;
        }
    }

    // 检查parent属性是否相等，如果a和b都有parent，则它们的parent也必须相等
    if (a.parent && b.parent) {
        if (!arePointsEqual(a.parent!.point, b.parent!.point)) {
            return false;
        }
    } else if (a.parent !== b.parent) {
        // 如果其中一个有parent而另一个没有，或者它们的parent不相等，则返回false
        return false;
    }

    // 如果所有属性都相等，则返回true
    return true;
}