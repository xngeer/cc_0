require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '1afe2EZyGJK+ZRoyQYUpt8V', 'Game');
// scripts/Game.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            'default': null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            'default': null,
            type: cc.Node
        },
        // score label 的引用
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取地平面的 y 轴坐标  todo 为什么要+this.ground.height/2
        this.groundY = this.ground.y + this.ground.height / 2;
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化计分
        this.score = 0;
    },

    spawnNewStar: function spawnNewStar() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // 将 Game 组件的实例传入星星组件
        newStar.getComponent('Star').game = this;
        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 轴坐标  todo 为什么要+50
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 轴坐标
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;

        // 返回星星坐标
        return cc.p(randX, randY);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星，就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        // test
        console.log({
            timer: this.timer,
            starDuration: this.starDuration
        });
        this.timer += dt;
    },

    gainScore: function gainScore() {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score:' + this.score.toString();
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    // todo 学习下结束时有什么行为
    // 结束时 reload 了是吧？没有显示成绩
    gameOver: function gameOver() {
        this.player.stopAllActions(); // 停止 player 节点的跳跃动作
        cc.director.loadScene('game');
    }
});

cc._RFpop();
},{}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, '62e69GPqh9FbYgondZHmbPG', 'Player');
// scripts/Player.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
        // 跳跃音效资源
        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        }
    },

    setJumpAction: function setJumpAction() {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;

        // 主角当前水平方向速度
        this.xSpeed = 0;

        // 初始化键盘输入监听
        this.setInputControl();
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;
    }
});

cc._RFpop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, '953a0AmGl1CNqil/h6WLQcX', 'Star');
// scripts/Star.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0
    },

    getPlayerDistance: function getPlayerDistance() {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之前的距离
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 调用 Game 脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    },

    // use this for initialization
    onLoad: function onLoad() {},

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});

cc._RFpop();
},{}]},{},["Game","Player","Star"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL3NjcmlwdHMvR2FtZS5qcyIsImFzc2V0cy9zY3JpcHRzL1BsYXllci5qcyIsImFzc2V0cy9zY3JpcHRzL1N0YXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcxYWZlMkVaeUdKSytaUm95UVlVcHQ4VicsICdHYW1lJyk7XG4vLyBzY3JpcHRzL0dhbWUuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDov5nkuKrlsZ7mgKflvJXnlKjkuobmmJ/mmJ/pooTliLbotYTmupBcbiAgICAgICAgc3RhclByZWZhYjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaYn+aYn+S6p+eUn+WQjua2iOWkseaXtumXtOeahOmaj+acuuiMg+WbtFxuICAgICAgICBtYXhTdGFyRHVyYXRpb246IDAsXG4gICAgICAgIG1pblN0YXJEdXJhdGlvbjogMCxcbiAgICAgICAgLy8g5Zyw6Z2i6IqC54K577yM55So5LqO56Gu5a6a5pif5pif55Sf5oiQ55qE6auY5bqmXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICAvLyBwbGF5ZXIg6IqC54K577yM55So5LqO6I635Y+W5Li76KeS5by56Lez55qE6auY5bqm77yM5ZKM5o6n5Yi25Li76KeS6KGM5Yqo5byA5YWzXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICAvLyBzY29yZSBsYWJlbCDnmoTlvJXnlKhcbiAgICAgICAgc2NvcmVEaXNwbGF5OiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlvpfliIbpn7PmlYjotYTmupBcbiAgICAgICAgc2NvcmVBdWRpbzoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgLy8g6I635Y+W5Zyw5bmz6Z2i55qEIHkg6L205Z2Q5qCHICB0b2RvIOS4uuS7gOS5iOimgSt0aGlzLmdyb3VuZC5oZWlnaHQvMlxuICAgICAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0IC8gMjtcbiAgICAgICAgLy8g5Yid5aeL5YyW6K6h5pe25ZmoXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG4gICAgICAgIC8vIOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xuICAgICAgICAvLyDliJ3lp4vljJborqHliIZcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24gc3Bhd25OZXdTdGFyKCkge1xuICAgICAgICAvLyDkvb/nlKjnu5nlrprnmoTmqKHmnb/lnKjlnLrmma/kuK3nlJ/miJDkuIDkuKrmlrDoioLngrlcbiAgICAgICAgdmFyIG5ld1N0YXIgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnN0YXJQcmVmYWIpO1xuICAgICAgICAvLyDlsIbmlrDlop7nmoToioLngrnmt7vliqDliLAgQ2FudmFzIOiKgueCueS4i+mdolxuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3Rhcik7XG4gICAgICAgIC8vIOS4uuaYn+aYn+iuvue9ruS4gOS4qumaj+acuuS9jee9rlxuICAgICAgICBuZXdTdGFyLnNldFBvc2l0aW9uKHRoaXMuZ2V0TmV3U3RhclBvc2l0aW9uKCkpO1xuICAgICAgICAvLyDlsIYgR2FtZSDnu4Tku7bnmoTlrp7kvovkvKDlhaXmmJ/mmJ/nu4Tku7ZcbiAgICAgICAgbmV3U3Rhci5nZXRDb21wb25lbnQoJ1N0YXInKS5nYW1lID0gdGhpcztcbiAgICAgICAgLy8g6YeN572u6K6h5pe25Zmo77yM5qC55o2u5raI5aSx5pe26Ze06IyD5Zu06ZqP5py65Y+W5LiA5Liq5YC8XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uIGdldE5ld1N0YXJQb3NpdGlvbigpIHtcbiAgICAgICAgdmFyIHJhbmRYID0gMDtcbiAgICAgICAgLy8g5qC55o2u5Zyw5bmz6Z2i5L2N572u5ZKM5Li76KeS6Lez6LeD6auY5bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pif55qEIHkg6L205Z2Q5qCHICB0b2RvIOS4uuS7gOS5iOimgSs1MFxuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZFkgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcbiAgICAgICAgLy8g5qC55o2u5bGP5bmV5a695bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pifIHgg6L205Z2Q5qCHXG4gICAgICAgIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XG5cbiAgICAgICAgLy8g6L+U5Zue5pif5pif5Z2Q5qCHXG4gICAgICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgLy8g5q+P5bin5pu05paw6K6h5pe25Zmo77yM6LaF6L+H6ZmQ5bqm6L+Y5rKh5pyJ55Sf5oiQ5paw55qE5pif5pif77yM5bCx5Lya6LCD55So5ri45oiP5aSx6LSl6YC76L6RXG4gICAgICAgIGlmICh0aGlzLnRpbWVyID4gdGhpcy5zdGFyRHVyYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB0ZXN0XG4gICAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgICAgIHRpbWVyOiB0aGlzLnRpbWVyLFxuICAgICAgICAgICAgc3RhckR1cmF0aW9uOiB0aGlzLnN0YXJEdXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lciArPSBkdDtcbiAgICB9LFxuXG4gICAgZ2FpblNjb3JlOiBmdW5jdGlvbiBnYWluU2NvcmUoKSB7XG4gICAgICAgIHRoaXMuc2NvcmUgKz0gMTtcbiAgICAgICAgLy8g5pu05pawIHNjb3JlRGlzcGxheSBMYWJlbCDnmoTmloflrZdcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOicgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCk7XG4gICAgICAgIC8vIOaSreaUvuW+l+WIhumfs+aViFxuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuc2NvcmVBdWRpbywgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvLyB0b2RvIOWtpuS5oOS4i+e7k+adn+aXtuacieS7gOS5iOihjOS4ulxuICAgIC8vIOe7k+adn+aXtiByZWxvYWQg5LqG5piv5ZCn77yf5rKh5pyJ5pi+56S65oiQ57upXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uIGdhbWVPdmVyKCkge1xuICAgICAgICB0aGlzLnBsYXllci5zdG9wQWxsQWN0aW9ucygpOyAvLyDlgZzmraIgcGxheWVyIOiKgueCueeahOi3s+i3g+WKqOS9nFxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2dhbWUnKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzYyZTY5R1BxaDlGYllnb25kWkhtYlBHJywgJ1BsYXllcicpO1xuLy8gc2NyaXB0cy9QbGF5ZXIuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxuICAgICAgICBqdW1wSGVpZ2h0OiAwLFxuICAgICAgICAvLyDkuLvop5Lot7Pot4PmjIHnu63ml7bpl7RcbiAgICAgICAganVtcER1cmF0aW9uOiAwLFxuICAgICAgICAvLyDmnIDlpKfnp7vliqjpgJ/luqZcbiAgICAgICAgbWF4TW92ZVNwZWVkOiAwLFxuICAgICAgICAvLyDliqDpgJ/luqZcbiAgICAgICAgYWNjZWw6IDAsXG4gICAgICAgIC8vIOi3s+i3g+mfs+aViOi1hOa6kFxuICAgICAgICBqdW1wQXVkaW86IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRKdW1wQWN0aW9uOiBmdW5jdGlvbiBzZXRKdW1wQWN0aW9uKCkge1xuICAgICAgICAvLyDot7Pot4PkuIrljYdcbiAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCB0aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uT3V0KCkpO1xuICAgICAgICAvLyDkuIvokL1cbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG4gICAgICAgIC8vIOa3u+WKoOS4gOS4quWbnuiwg+WHveaVsO+8jOeUqOS6juWcqOWKqOS9nOe7k+adn+aXtuiwg+eUqOaIkeS7rOWumuS5ieeahOWFtuS7luaWueazlVxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xuICAgICAgICAvLyDkuI3mlq3ph43lpI1cbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93biwgY2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gcGxheUp1bXBTb3VuZCgpIHtcbiAgICAgICAgLy8g6LCD55So5aOw6Z+z5byV5pOO5pKt5pS+5aOw6Z+zXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgc2V0SW5wdXRDb250cm9sOiBmdW5jdGlvbiBzZXRJbnB1dENvbnRyb2woKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5re75Yqg6ZSu55uY5LqL5Lu255uR5ZCsXG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcbiAgICAgICAgICAgIC8vIOacieaMiemUruaMieS4i+aXtu+8jOWIpOaWreaYr+WQpuaYr+aIkeS7rOaMh+WumueahOaWueWQkeaOp+WItumUru+8jOW5tuiuvue9ruWQkeWvueW6lOaWueWQkeWKoOmAn1xuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbiBvbktleVByZXNzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g5p2+5byA5oyJ6ZSu5pe277yM5YGc5q2i5ZCR6K+l5pa55ZCR55qE5Yqg6YCfXG4gICAgICAgICAgICBvbktleVJlbGVhc2VkOiBmdW5jdGlvbiBvbktleVJlbGVhc2VkKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgLy8g5Yid5aeL5YyW6Lez6LeD5Yqo5L2cXG4gICAgICAgIHRoaXMuanVtcEFjdGlvbiA9IHRoaXMuc2V0SnVtcEFjdGlvbigpO1xuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuanVtcEFjdGlvbik7XG5cbiAgICAgICAgLy8g5Yqg6YCf5bqm5pa55ZCR5byA5YWzXG4gICAgICAgIHRoaXMuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XG5cbiAgICAgICAgLy8g5Li76KeS5b2T5YmN5rC05bmz5pa55ZCR6YCf5bqmXG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgICAvLyDliJ3lp4vljJbplK7nm5jovpPlhaXnm5HlkKxcbiAgICAgICAgdGhpcy5zZXRJbnB1dENvbnRyb2woKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICAvLyDmoLnmja7lvZPliY3liqDpgJ/luqbmlrnlkJHmr4/luKfmm7TmlrDpgJ/luqZcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgICAvLyDpmZDliLbkuLvop5LnmoTpgJ/luqbkuI3og73otoXov4fmnIDlpKflgLxcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueFNwZWVkKSA+IHRoaXMubWF4TW92ZVNwZWVkKSB7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmoLnmja7lvZPliY3pgJ/luqbmm7TmlrDkuLvop5LnmoTkvY3nva5cbiAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy54U3BlZWQgKiBkdDtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzk1M2EwQW1HbDFDTnFpbC9oNldMUWNYJywgJ1N0YXInKTtcbi8vIHNjcmlwdHMvU3Rhci5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5pif5pif5ZKM5Li76KeS5LmL6Ze055qE6Led56a75bCP5LqO6L+Z5Liq5pWw5YC85pe277yM5bCx5Lya5a6M5oiQ5pS26ZuGXG4gICAgICAgIHBpY2tSYWRpdXM6IDBcbiAgICB9LFxuXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uIGdldFBsYXllckRpc3RhbmNlKCkge1xuICAgICAgICAvLyDmoLnmja4gcGxheWVyIOiKgueCueS9jee9ruWIpOaWrei3neemu1xuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRQb3NpdGlvbigpO1xuICAgICAgICAvLyDmoLnmja7kuKTngrnkvY3nva7orqHnrpfkuKTngrnkuYvliY3nmoTot53nprtcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xuICAgICAgICByZXR1cm4gZGlzdDtcbiAgICB9LFxuXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uIG9uUGlja2VkKCkge1xuICAgICAgICAvLyDlvZPmmJ/mmJ/ooqvmlLbpm4bml7bvvIzosIPnlKggR2FtZSDohJrmnKzkuK3nmoTmjqXlj6PvvIznlJ/miJDkuIDkuKrmlrDnmoTmmJ/mmJ9cbiAgICAgICAgdGhpcy5nYW1lLnNwYXduTmV3U3RhcigpO1xuICAgICAgICAvLyDosIPnlKggR2FtZSDohJrmnKznmoTlvpfliIbmlrnms5VcbiAgICAgICAgdGhpcy5nYW1lLmdhaW5TY29yZSgpO1xuICAgICAgICAvLyDnhLblkI7plIDmr4HlvZPliY3mmJ/mmJ/oioLngrlcbiAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgLy8g5q+P5bin5Yik5pat5ZKM5Li76KeS5LmL6Ze055qE6Led56a75piv5ZCm5bCP5LqO5pS26ZuG6Led56a7XG4gICAgICAgIGlmICh0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpIHtcbiAgICAgICAgICAgIC8vIOiwg+eUqOaUtumbhuihjOS4ulxuICAgICAgICAgICAgdGhpcy5vblBpY2tlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIOagueaNriBHYW1lIOiEmuacrOS4reeahOiuoeaXtuWZqOabtOaWsOaYn+aYn+eahOmAj+aYjuW6plxuICAgICAgICB2YXIgb3BhY2l0eVJhdGlvID0gMSAtIHRoaXMuZ2FtZS50aW1lciAvIHRoaXMuZ2FtZS5zdGFyRHVyYXRpb247XG4gICAgICAgIHZhciBtaW5PcGFjaXR5ID0gNTA7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvICogKDI1NSAtIG1pbk9wYWNpdHkpKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7Il19
