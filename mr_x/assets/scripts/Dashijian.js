cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.bindEvents();
    },
    
    bindEvents : function(){
        var that = this;
        this.node.on("mouseup", function(event){
            alert("跳转");
        }.bind(this));
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
