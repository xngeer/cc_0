cc.Class({
    extends: cc.Component,

    properties: {
        Huodong : {
            default : null,
            type : cc.Node,
        },
        Info : {
            default : null,
            type : cc.Node,
        },
    },
    
    setAllToNormal : function(){
        var that = this;
        this.activeList.forEach(function(key){
            that[key].getComponent(key).showNormal();
        });
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        this.activeList = ["Huodong", "Info"];
        this.activeList.forEach(function(key){
            // getComponent! 这种方式显然不够好 todo
            that[key].getComponent(key).game = that;
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
