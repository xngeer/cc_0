/*
    要点:
        1. 父元素的属性对所有子元素有效，如 scale : 0.5
        2. 添加事件用 this.node.on 
        3. 组件间的交互
            properties 中引入
            B节点通过 getComponent 获取A节点的引用，并将B节点的引用赋值给A的属性
        4. runAction 执行动画或动画序列
*/

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
