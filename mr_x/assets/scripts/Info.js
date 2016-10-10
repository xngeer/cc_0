cc.Class({
    extends: cc.Component,

    properties: {
        // normal
        normal : {
            default : null,
            type : cc.Node,
        },
        // active 
        active : {
            default : null,
            type : cc.Node,
        },
    },
    
    // use this for initialization
    onLoad: function () {
        // 默认状态
        this.is_opened = false;
        this.bindEvents();
    },
    
    // 状态切换
    showActive : function(){
        this.game.setAllToNormal();
        this.normal.opacity = 0;
        this.active.opacity = 255;
        this.is_opened = true;
    },
    showNormal : function(){
        this.normal.opacity = 255;
        this.active.opacity = 0;
        this.is_opened = false;
    },
    
    bindEvents : function(){
        var that = this;
        this.node.on("mouseup", function(event){
            if(!that.is_opened){
                that.showActive();
                return;
            }
            alert("跳转");
        }.bind(this));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
