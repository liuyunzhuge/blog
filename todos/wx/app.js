//app.js
App({
  onLaunch: function () {
    var todos =wx.getStorageSync( 'todos' ) || [];
    wx.setStorageSync('todos', todos);
  },
  getUserInfo:function(cb){
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo);
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo);
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  getId: (function(){
    var start = 1;
    return function(){
      return start++;
    }
  })()
});