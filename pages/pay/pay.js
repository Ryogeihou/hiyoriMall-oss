// pages/cart/cart.js
//黑马 p54 
const app = getApp()
const db = wx.cloud.database()
Page({
  data:{
    carts:[],
    total:0,
    address:{},
    totalPrice:0,
    totalNum:0
  },

  handleChooseAddress(){
    wx.getSetting({
      success: (result) => {
        const scopeAddress = result.authSetting["scope.address"] ;
        if(scopeAddress===false){
          wx.openSetting({
            success: () => {
              wx.chooseAddress({
                success:(result3)=>{
                  // const address = await chooseAddress();
                  // wx.setStorageSync("address", address);
                  this.setData({
                    address:result3
                  })
                  // console.log(result3);
                }
              });
            },
          });
        }else{
          wx.chooseAddress({
            success:(result1)=>{
              // const address = await chooseAddress();
              // wx.setStorageSync("address", address);
              this.setData({
                address:result1
              })
              console.log(result1);
            }
          });
        }
      }
    });
      
  },
  //商品选中


  //设置购物车状态同时重新计算底部工具栏 全选 总价 购买数量
  // setCarts(carts){
  //   // this.setData({
  //   //   carts
  //   // })
  //   let allChecked = true;
  //   // 1 总价格 总数量
  //   let totalPrice = 0;
  //   let totalNum = 0;
  //   carts.forEach(v=>{
  //     if(v.checked){
  //       totalPrice+=v.num*v.price;
  //       totalNum+=v.num;
  //     }else{
  //       allChecked = false;
  //     }
  //   })
  //   //判断数组是否为空
  //   allChecked = carts.length!=0?allChecked:false;
  //   this.setData({
  //     carts,
  //     totalNum,
  //     totalPrice,
  //     allChecked
  //   })
  //   wx.setStorageSync("carts",carts);
  //   app.globalData.carts = carts
  // },
  
  toDetail(e) {
    const id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
    console.log(e)
  },
  onShow(){
    let address = wx.getStorageSync("address");
    let carts = wx.getStorageSync("carts")||[];
    // 1 
    carts = carts.filter(v => v.checked);
    let totalPrice = 0;
    let totalNum = 0;
    carts.forEach(v=>{
      if(v.checked){
        totalPrice+=v.num*v.price;
        totalNum+=v.num;
      }
    })
    //判断数组是否为空
    this.setData({
      carts,
      totalNum,
      totalPrice,
      // address
    })
    // wx.setStorageSync("carts",carts);
    // app.globalData.carts = carts
  }
})
