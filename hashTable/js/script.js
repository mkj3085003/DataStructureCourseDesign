$(document).ready(function () {
  $('body').removeClass('fade-out'); // 移除淡出类，启用淡入效果
});
const app = new Vue({
  el: '#app',
  data: {
    ht: new HashTable(),
    limit: '',
    InputLimit: true,
    newKey: '',
    newValue: '',
    searchKey: '',
    searchedValue: null, // 设置初始值为 null
    deleteKey: '',
    isDraw: true,
    canvas: null, // 声明 canvas 变量

  },
  mounted() {
    // 创建 Fabric.js canvas 实例
    // this.canvas = new fabric.Canvas('c');
    this.canvas = new fabric.Canvas('c', {
      backgroundColor: '#ffffff', // 设置画布背景色
      selection: false, // 禁用选择功能
    });
    // this.ht.put('class1', 'Tom');
    // this.ht.put('class2', 'Mary');
    // this.ht.put('class3', 'Gogo');
    // this.ht.put('class4', 'Tony');
    // this.ht.put('class4', 'Vibi');
    // this.ht.put('class5', 'shenxian');
    // this.ht.put('class6', 'value6');
    // this.ht.put('class7', 'value7');
    // this.ht.put('class8', 'value8');
    // console.log('ht after create:', this.ht); // 监视 ht 的值
  },
  watch: {
    'ht.limit': function () {
      this.drawHashTable();
    },
    'ht.storage': function () {
      this.drawHashTable();
    },
  },
  methods: {
    create: function () {
      // 获取输入的 limit 值并尝试将其转换为整数
      const limitValue = parseInt(this.limit);

      if (isNaN(limitValue) || !Number.isInteger(limitValue) || limitValue <= 0) {
        // 如果 limit 不是有效的正整数，弹出警告
        alert('请先输入有效的正整数作为 limit 的值！');
        return; // 不执行后续操作
      }

      this.ht.limit = limitValue; // 设置 ht.limit，会自动更新画布
      this.InputLimit = false;
      this.isDraw = true;
      this.drawHashTable();

      // 设置成功后弹出提示
      alert(`Limit 设置成功：${limitValue}`);
    },
    resetInput: function () {
      this.ht.limit = 0;
      this.ht.storage = [];
      this.limit = '';
      this.InputLimit = true;
      this.isDraw = false;
      this.drawHashTable();
      alert('哈希表重置成功！');
    },
    InsertOrEdit: function () {
      if (this.newKey && this.newValue) {
        const result = this.ht.put(this.newKey, this.newValue); // 此时storage会改变，画布会自动刷新

        if (result === 0) {
          alert(`(${this.newKey},${this.newValue})插入成功`);
        }
        else if (result === 1) {
          alert(`(${this.newKey},${this.newValue})修改成功`);
        }
        this.newKey = '';
        this.newValue = '';
        this.drawHashTable();
      }
      else {
        alert(`请输入查找和编辑必要的key和value值`);
      }
    },
    Retrieve: function () {
      this.searchedValue = this.ht.get(this.searchKey);
    },
    Remove: function () {
      if (this.deleteKey) {
        const deleteValue = this.ht.remove(this.deleteKey); // 此时storage会改变，画布会自动刷新
        this.drawHashTable();
        alert(`(${this.deleteKey},${deleteValue})删除成功`);
        this.deleteKey = '';
      }
      else {
        alert(`哈希表中不存在该key值:${this.deleteKey}`);
      }
    },
    redirectToHome: function () {
      window.location.href = "../index.html";
    },
    drawBucket(x, y, index) {
      // 创建文本对象以显示桶的索引
      //如果是一位数
      var text;
      if (index < 10) {
        text = new fabric.Text(`${index}`, {
          left: 0, // 在矩形中心偏左一点
          top: y + 20, // 在矩形上方一点点
          fontSize: 24,
          fill: 'white', // 青色
          fontFamily: 'Comic Sans MS', // 使用特定字体
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.5)', // 阴影颜色为半透明黑色
            offsetX: 2,
            offsetY: 2,
            blur: 4
          })
        });

      }
      //如果是两位数
      else if (index < 100) {
        text = new fabric.Text(`${index}`, {
          left: 0, // 在矩形中心偏左一点
          top: y + 10, // 在矩形上方一点点
          fontSize: 24,
          fill: 'white', // 青色
          fontFamily: 'Comic Sans MS', // 使用特定字体
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.5)', // 阴影颜色为半透明黑色
            offsetX: 2,
            offsetY: 2,
            blur: 4
          })
        });

      }
      // 创建线性渐变对象（蓝紫色渐变）
      const linearGradient = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: 100 },
        colorStops: [
          { offset: 0, color: 'blue' },
          { offset: 1, color: 'purple' }
        ]
      });

      // 创建矩形并应用渐变、圆角和阴影
      const rectangle = new fabric.Rect({
        left: x,
        top: y,
        width: 50,
        height: 50,
        fill: linearGradient,
        rx: 10, // 圆角半径
        ry: 10, // 圆角半径
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.5)',
          offsetX: 5,
          offsetY: 5,
          blur: 10
        })
      });
      this.canvas.add(rectangle, text);
    },
    // 绘制链表
    // 绘制链表
    createLinkedListNode(key, value, x, y) {
      const rectWidth = 50;
      const rectHeight = 50;
      const shadowOffset = 5;
      const nodeWidth = rectWidth * 2 + 20;

      // 创建一个组来包含三个矩形和文本
      const nodeGroup = new fabric.Group([], {
        left: x,
        top: y,
      });

      // 创建第一个矩形，放置 key 值
      const keyRect = new fabric.Rect({
        width: rectWidth,
        height: rectHeight,
        fill: '#6A5ACD',
        strokeWidth: 0,
        shadow: new fabric.Shadow({
          color: 'rgba(106, 90, 205, 0.5)',
          offsetX: shadowOffset,
          offsetY: shadowOffset,
          blur: shadowOffset,
        }),
      });

      const keyText = new fabric.Text(key.toString(), {
        left: rectWidth / 2,
        top: rectHeight / 2,
        fontSize: 16,
        fill: 'white',
        originX: 'center',
        originY: 'center',
      });

      // ...

      // 创建第二个矩形，放置 value 值
      const valueRect = new fabric.Rect({
        width: rectWidth,
        height: rectHeight,
        fill: '#FF1493',
        strokeWidth: 0,
        shadow: new fabric.Shadow({
          color: 'rgba(255, 20, 147, 0.5)',
          offsetX: shadowOffset,
          offsetY: shadowOffset,
          blur: shadowOffset,
        }),
      });

      const valueText = new fabric.Text(value.toString(), {
        left: rectWidth / 2,
        top: rectHeight / 2,
        fontSize: 16,
        fill: 'white',
        originX: 'center',
        originY: 'center',
      });

      // ...

      // 创建第三个矩形
      const iconRect = new fabric.Rect({
        width: 20,
        height: rectHeight,
        fill: '#8B008B',
        strokeWidth: 0,
        shadow: new fabric.Shadow({
          color: 'rgba(139, 0, 139, 0.5)',
          offsetX: shadowOffset,
          offsetY: shadowOffset,
          blur: shadowOffset,
        }),
      });

      // ...

      // 设置矩形和文本的位置，相对于组的左上角
      keyRect.set({ left: 0, top: 0 });
      valueRect.set({ left: rectWidth, top: 0 });
      iconRect.set({ left: rectWidth * 2, top: 0 });
      keyText.set({ left: rectWidth / 2, top: rectHeight / 2 });
      valueText.set({ left: rectWidth * 1.5, top: rectHeight / 2 });

      // 将矩形和文本添加到组中
      nodeGroup.addWithUpdate(keyRect);
      nodeGroup.addWithUpdate(valueRect);
      nodeGroup.addWithUpdate(iconRect);
      nodeGroup.addWithUpdate(keyText);
      nodeGroup.addWithUpdate(valueText);

      // 创建一个大矩形，用于包裹三个矩形和文本
      const bigRect = new fabric.Rect({
        width: nodeWidth,
        height: rectHeight,
        fill: 'transparent',
        stroke: '#95a5a6',
        strokeWidth: 2,
      });

      // 将大矩形添加到组中，确保它位于所有其他元素之上
      nodeGroup.addWithUpdate(bigRect);

      nodeGroup.set({ left: x, top: y });

      // 将组添加到画布中
      this.canvas.add(nodeGroup);
    },
    drawArrow(startX, startY, endX, endY, arrowWidth, arrowHeight) {
      // 绘制直线部分
      const line = new fabric.Line([startX, startY, endX - arrowWidth, endY], {
        stroke: 'black',
        strokeWidth: 2
      });
      this.canvas.add(line);
      // 绘制箭头头部
      const arrowHead = new fabric.Triangle({
        width: arrowWidth,
        height: arrowHeight,
        fill: 'black',
        left: endX - 5, // 绘制在直线终点
        top: endY - 7,
        angle: 90 // 旋转箭头使其指向右边
      });
      this.canvas.add(arrowHead);
    },

    // 绘制哈希表
    // 绘制哈希表
    drawHashTable() {
      if (!this.isDraw) {
        this.canvas.clear(); // 清空画布
        return;
      }
      this.canvas.clear(); // 清空画布

      let contentWidth = 0; // 初始化内容宽度
      let contentHeight = 0; // 初始化内容高度

      const bucketWidth = 50;//起始结点的宽度
      const bucketHeight = 50;//起始结点的高度
      const nodeWidth = 120;//链表一个结点的宽度
      const spacing = 20;//中间空隙空间的宽度


      for (let i = 0; i < this.ht.limit; i++) {
        const x = 40;
        const y = i * (bucketHeight + spacing);
        contentWidth = x + bucketWidth;
        contentHeight = y + bucketHeight;

        this.drawBucket(x, y, i); // 绘制桶

        const values = this.ht.storage[i];

        if (values) {
          const numValues = Object.keys(values).length;
          if (numValues != 0) {
            this.drawArrow(x + bucketWidth, y + bucketHeight / 2, x + bucketWidth + spacing * 3, y + bucketHeight / 2, 15, 15);

            let prevNode = null; // 用于追踪前一个节点

            // 遍历桶中的链表节点并绘制
            for (const [index, value] of values.entries()) {

              const nodeX = x + bucketWidth + spacing * 3 + index * (nodeWidth + spacing * 3);
              const nodeY = y;

              // 绘制链表节点
              this.createLinkedListNode(value[0], value[1], nodeX, nodeY);

              // 绘制箭头连接到前一个节点
              if (prevNode) {
                const arrowStartX = prevNode.left + nodeWidth;
                const arrowStartY = prevNode.top + bucketHeight / 2;
                const arrowEndX = nodeX;
                const arrowEndY = prevNode.top + bucketHeight / 2;
                this.drawArrow(arrowStartX, arrowStartY, arrowEndX, arrowEndY, 15, 15);
              }

              prevNode = { left: nodeX, top: nodeY };

              // 更新内容宽度和高度
              contentWidth = Math.max(contentWidth, nodeX + nodeWidth);
              contentHeight = Math.max(contentHeight, nodeY + bucketHeight);
            }

          }

        }
      }
      if (contentWidth > 1150){
        this.canvas.setWidth(contentWidth);
      }
      if(contentHeight > 658) {
        this.canvas.setHeight(contentHeight);
      }
    }
  },
});
