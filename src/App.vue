<script setup lang="ts">
import {onBeforeMount, Ref, ref} from 'vue'
import avalible from './assets/草地.png'
import wall from './assets/wall.png'
import vectory from './assets/vectory.png'
import person from './assets/person.png'
import next from './assets/step.png'
import reset from './assets/reset.png'
import {areTreeNodesEqual, createTreeNode, MapObject, treeNode} from "./types";
import {ElMessage} from "element-plus";
import {dirent} from "./types";

/**
 * 创建10*10的二维数组
 * @param ele 二维数组的值，0或者false
 */
const createMat = (ele: number | boolean) => {
  return Array.from({length: 10}, () => Array(10).fill(ele))
}

/**
 * 创建地图，返回一个地图信息，包括起点，终点
 */
const createMap = () => {
  // 创建一个10x10的二维数组，所有元素初始为0（可行）
  let map = createMat(0);

  // 随机设置一些障碍物
  for (let i = 0; i < map.length * map[0].length / 4; i++) {
    let x = Math.floor(Math.random() * map.length);
    let y = Math.floor(Math.random() * map[0].length);
    map[x][y] = 1;
  }

  // 随机生成起点和终点，确保它们不是障碍物或相同位置
  let start = {x: 0, y: 0};
  let end = {x: 0, y: 0};
  do {
    start.x = Math.floor(Math.random() * map.length);
    start.y = Math.floor(Math.random() * map[0].length);
  } while (map[start.x][start.y] === 1);

  do {
    end.x = Math.floor(Math.random() * map.length);
    end.y = Math.floor(Math.random() * map[0].length);
  } while (map[end.x][end.y] === 1 || end.x === start.x && end.y === start.y);

  // 返回包含地图、起点和终点的对象
  return {
    map: map,
    start: start,
    end: end
  };
}

// 直着走所产生的花销
const ZXDJ = 10
// 斜着走所产生的花销
const XXDJ = 14

const pathMap = ref()
const mapObject: Ref<MapObject> = ref(createMap())
const current: Ref<treeNode> = ref(createTreeNode(0, 0))
const buff: Ref<Array<treeNode>> = ref([])
const root: Ref<treeNode> = ref(createTreeNode(0, 0))
const child: Ref<treeNode> = ref(createTreeNode(0, 0))
const optimal: Ref<treeNode> = ref(createTreeNode(0, 0))


/**
 * 检查数值的合法性
 * @param index
 */
const checkValid = (index: number) => {
  return index >= 0 && index < 10
}

const getH = (row: number, col: number) => {
  let x = Math.abs(row - mapObject.value.end.x)
  let y = Math.abs(col - mapObject.value.end.y)
  return (x + y) * ZXDJ
}

/**
 * 页面初始化
 */
const init = () => {
  pathMap.value = createMat(false)
  mapObject.value = createMap()
  current.value = createTreeNode(mapObject.value.start.x, mapObject.value.start.y)
  pathMap.value[mapObject.value.start.x][mapObject.value.start.y] = true
  buff.value = []
  root.value = createTreeNode(mapObject.value.start.x, mapObject.value.start.y)
  child.value = createTreeNode(-1, -1)
  optimal.value = createTreeNode(-1, -1)
}

/**
 * 将索引转换带二维数组中的坐标
 * @param index  索引，取值范围为[1,100]
 */
const getPosition = (index: number) => {
  index -= 1
  let x = Math.floor(index / 10);
  let y = index % 10;
  // return mapObject.value.map[x][y] === 0
  return {x, y}
}
/**
 * 渲染地图
 * @param index 索引，范围为[1,100]
 */
const showImg = (index: number) => {
  let position = getPosition(index)
  if (position.x === current.value.point.row && position.y === current.value.point.col) {
    return person
  } else if (position.x === mapObject.value.end.x && position.y === mapObject.value.end.y) {
    return vectory
  } else if (mapObject.value.map[position.x][position.y] === 0) {
    return avalible
  } else {
    return wall
  }
}

/**
 * 寻找下一个可走的路径
 */
const nestStep = () => {
  // 0.先判断是否终点到了
  if (mapObject.value.end.x === current.value.point.row && mapObject.value.end.y === current.value.point.col) {
    ElMessage({
      type: 'success',
      message: "找到终点了"
    })
    return
  }

  // 1.找出周围能走的点 8个
  for (let i = 0; i < 8; i++) {
    child.value = createTreeNode(current.value.point.row, current.value.point.col)
    switch (i) {
      case dirent.p_up:
        child.value.point.row--;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_down:
        child.value.point.row++;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_left:
        child.value.point.col--;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_right:
        child.value.point.col++;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_lup:
        child.value.point.col--;
        child.value.point.row--;
        child.value.point.g += XXDJ;
        break;
      case dirent.p_rup:
        child.value.point.col--;
        child.value.point.row++;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_ldown:
        child.value.point.col++;
        child.value.point.row--;
        child.value.point.g += ZXDJ;
        break;
      case dirent.p_rdown:
        child.value.point.col++;
        child.value.point.row++;
        child.value.point.g += ZXDJ;
        break;
    }
    // 检查child能够能走
    if (checkValid(child.value.point.row) && checkValid(child.value.point.col) && mapObject.value.map[child.value.point.row][child.value.point.col] == 0 && pathMap.value[child.value.point.row][child.value.point.col] === false) {
      // 计算h值
      child.value.point.h = getH(child.value.point.row, child.value.point.col)

      // 计算f值
      child.value.point.f = child.value.point.g + child.value.point.h

      // 入树
      current.value.children.push(child.value)
      child.value.parent = current.value

      // 入数组
      buff.value.push(child.value)
    } else {
      child.value = createTreeNode(-1, -1)
    }
  }
  // 2.数组中挑选f最小的点
  optimal.value = buff.value[0]
  for (let i = 0; i < buff.value.length; i++) {
    if (optimal.value.point.f > buff.value[i].point.f) {
      optimal.value = buff.value[i]
    }
  }
  // 3.走
  current.value = optimal.value

  // 4 将最优节点删去
  buff.value = buff.value.filter((cur) => {
    return !areTreeNodesEqual(cur, optimal.value)
  })
  // 5.将当前点标记走过
  pathMap.value[current.value.point.row][current.value.point.col] = true

  // 6.遇到终点 或者整个地图找遍了还没找到终点，结束
  if (mapObject.value.end.x === current.value.point.row && mapObject.value.end.y === current.value.point.col) {
    ElMessage({
      type: 'success',
      message: "找到终点了"
    })
  }
  if (buff.value.length === 0) {
    ElMessage({
      type: 'error',
      message: "找不到终点"
    })
  }

}

/**
 * 刷新界面
 */
const resetPage = () => {
  init()
  ElMessage({
    type: 'success',
    message: "刷新成功",
    showClose: true
  })
}
onBeforeMount(() => {
  init()
})
</script>

<template>
  <div class="title">A start 寻路算法</div>
  <div class="layout">
    <div>
      <el-tooltip content="点击执行下一步" effect="customized">
        <el-image :src="next" @click="nestStep"></el-image>
      </el-tooltip>
    </div>
    <div class="content">
      <img alt="" v-for="index in 100" :key="index" :src="showImg(index)">
    </div>
    <div>
      <el-tooltip content="点击刷新地图" effect="customized">
        <el-image :src="reset" @click="resetPage"></el-image>
      </el-tooltip>
    </div>
  </div>
</template>

<style>
body {
  background-image: url("./assets/bg.png");
  background-size: cover;
}

.layout {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.content {
  width: 700px;
  height: 700px;
  border: azure solid 1px;

}

img {
  margin-left: 5px;
  margin-top: 5px;
}

.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
.title{
  font-size: 70px;   /*设置文字大小*/
  color:#3366FF;  /*设置文字颜色*/
  text-shadow: 0 8px 10px #6699FF;  /*设置文字阴影*/
  font-weight: bolder;  /*设置文字宽度*/
  text-align: center;  /*设置文字居中*/
}
</style>
