// pages/cart/cart.js

//黑马 p41 优化购物车代码
const app = getApp()
const db = wx.cloud.database()
Page({
  data:{
    carts:[],
    total:0,
    address:{},
    allChecked:false,
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
  handeItemChange(e){
    //1 获取被修改的商品id
    // 【重要】 p46 传值取值方法
    let rhid = e.currentTarget.dataset.item;
    console.log(rhid);
    // let rhid2 = e.currentTarget.dataset;
    // console.log(rhid2);  //此处获取的为item数组
    //2 获取购物车数组
    let{carts}=this.data;
    //3 找到被修改的商品对象
    let index=carts.findIndex(v=>v.rhid===rhid);
    //4 选中状态取反
    carts[index].checked =! carts[index].checked;
    //5 6 把购物车数据重新设置回data中和缓存中
    this.setCarts(carts);
  },

  //设置购物车状态同时重新计算底部工具栏 全选 总价 购买数量
  setCarts(carts){
    // this.setData({
    //   carts
    // })
    let allChecked = true;
    // 1 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    carts.forEach(v=>{
      if(v.checked){
        totalPrice+=v.num*v.price;
        totalNum+=v.num;
      }else{
        allChecked = false;
      }
    })
    //判断数组是否为空
    allChecked = carts.length!=0?allChecked:false;
    this.setData({
      carts,
      totalNum,
      totalPrice,
      allChecked
    })
    wx.setStorageSync("carts",carts);
    app.globalData.carts = carts
  },
  //商品全选功能
  handleItemAllCheck(){
    // 1 获取data中的数据
    let {carts,allChecked}=this.data;
    // 2 修改值
    allChecked =! allChecked;
    // 3 循环修改cart数组中的商品状态
    carts.forEach(v=>v.checked=allChecked);
    // 4 把修改后的值 填充回data或者缓存中
    this.setCarts(carts)
  },
  //商品数量编辑功能
  handleItemNumEdit(e){
    // 1 获取传递过来的参数
    const {operation,id}=e.currentTarget.dataset;
    // 2 获取购物车数组
    let {carts} = this.data;
    // 3 找到需要修改的商品索引
    const index = carts.findIndex(v=>v.rhid===id);
    // 4 判断是否要执行删除
    if(carts[index].num===1&&operation===-1){
      wx.showModal({
        title: '提示',
        content: '您是否要删除',
        success: (res) => {
          if (res.confirm) {
            carts.splice(index,1);
            this.setCarts(carts);
          }else if(res.cancel){
            console.log("用户点击取消")
          }
        },
        fail: () => {},
        complete: () => {}
      });
        
    }else{
      // 4 进行修改数量
      carts[index].num+= operation;
      // 5 设置回缓存和data中
      this.setCarts(carts);
    }
  },
  handlePay(){
  // 1 判断收货地址
  const {address,totalNum} = this.data;
  // const a = this.totalNum;
  if(!address.userName){
    wx.showToast({
      title: '请选择收货地址',
      icon:'none'
    });
    return;
  }
  // 2 判断用户有没有选购商品
  if(totalNum===0){
    wx.showToast({
      title: '快去选购商品呀',
      icon:'none'
    });
    return;
  }
  // 3 跳转到 支付页面
  wx.navigateTo({
    url:'/pages/pay/pay'
  })
},

  

  minusCart(e) {
    const { index } = e.currentTarget.dataset //小程序里传递数据的一个方法
    const carts1 = [...this.data.carts]
    if (cart[index].num > 0){
      carts[index].num -= 1
      this.setData({
        carts
      })
      app.globalData.carts = carts
      app.setTabbar()
        this.getTotal()//button数字响应
     }
  },
  addCart(e) {
    const { index } = e.currentTarget.dataset //小程序里传递数据的一个方法
    const carts = [...this.data.carts]
    carts[index].num += 1
    this.setData({
      carts
    })
    app.globalData.carts = carts
    app.setTabbar()
    this.getTotal()//button数字响应
  },
  
  toDetail(e) {
    const id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
    console.log(e)
  },
  onShow(){
    this.setData({
      carts:app.globalData.carts,
    })
    const carts = wx.getStorageSync("carts")||[];
    this.setCarts(carts);
    // this.setData({
    //   address
    // })
    
    // this.getTotal()
    // const address = wx.getStorageSync("address");
    // this.setData({
    //   address
    // })
    // const cart =wx.getStorageSync("cart")||[];
    // const allChecked=cart.length?every(v=>checked):false;
    // this.setData({
    //   cart,
    //   allChecked
    // })
   
   
    // this.setData({
    //   totalNum,
    //   totalPrice
    // })    
    // getTotal(){
    //   let allChecked = true;
    //   let totalPrice = 0;
    //   let totalNum = 0;
    //   const carts=app.globalData.carts
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
    //   //给data赋值
    //   this.setData({
    //     totalNum,
    //     totalPrice,
    //     allChecked
    //   })
    //   // console.log(totalNum+"aa_"+totalPrice)    
    //   const total = this.data.carts.reduce((sum,a)=>sum + a.price*a.num, 0)
    //   this.setData({
    //     total
    //   })
    // },
  // order(){//腾讯云大学
  //   if(!this.data.address.userName){
  //     wx.chooseAddress({
  //       success:res=>{
  //         this.setData({
  //           address:res
  //         })
  //         db.collection('userInfo').add({
  //           data:{
  //           "resuserName" : res.resuserName,
  //           "telNumber" : res.telNumber,
  //           "cityName" : res.cityName,
  //           "countyName" : res.countyName,
  //             "detailInfo": res.detailInfo
  //           }
  //         })
  //         console.log(res)
  //       }
  //     })
  //   }else{
  //   }
  // },
  }
})
