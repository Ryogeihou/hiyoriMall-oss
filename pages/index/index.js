// pages/index/index.js
import regeneratorRuntime from'../../lib/runtime/runtime';

const db =wx.cloud.database()
const app = getApp()
Page({
  data:{
    list:[],
    tops:[],
    categories: [],
    noticeList: [],
    banner:[]
  },
   async getNotice(){
      await db.collection('notice').where({status: true}).orderBy('sort', 'desc').get({
      success: res => {
        this.setData({
          noticeList:res.data.filter(v => v.type === 0),
          banner: res.data.filter(v => v.type ===1)
        })
      }
  
    })
  },
  addCart(e){
    console.log(e.currentTarget)
    const {item} = e.currentTarget.dataset //小程序里传递数据的一个方法
    const i = app.globalData.carts.findIndex(v=>v._id==item._id)
    if(i>-1){
      // 已经存在，数量加一
      app.globalData.carts[i].num += 1
    }else{
      item.num = 1
      item.checked = true
      app.globalData.carts.push(item)
    }
    app.setTabbar()
    wx.showToast({
      title: '加入成功',
      icon: 'succes',
      //防止手抖
      // mask: true
    });
      
  },
  onPullDownRefresh(){
    this.getList(true)
    wx.stopPullDownRefresh()
  },
  onReachBottom(){
    this.page +=1
    this.getList()
  }, 
  
  toDetail(e){
    const id = e.currentTarget.id
    console.log(e)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },

  async getList(isInit){
    const PAGE =8
    wx.showLoading({
      title: '加载中',
    })
    await db.collection('rhnewbee').where({
      selling: true
    }).skip(this.page * PAGE).limit(PAGE).get({
      success: res => {
        // console.log('触底刷新', res.data)
        if(isInit){
          this.setData({
            list: res.data
          })
        }else{
          //下拉刷新，不能直接覆盖而是累加
          this.setData({
            list: this.data.list.concat(res.data)
          })
          wx.stopPullDownRefresh()
        }
        wx.hideLoading()
      }
    })
  },
  getTops(){
    db.collection('rhnewbee').orderBy('count','desc').limit(4).get({
      success:res=>{
        // console.log(res.data[0].pics[0])
        this.setData({
          // tops:{
          //   image:res[0].image,
          //   image:res[1].image,
          //   image:res[2].image,
          //   image:res[3].image
          // }
          tops:res.data
          // tops:{ 单个商品详细页面可以这样设置，tops列表为4个商品
          //   count:res.data.count,
          //   image:res.data.image
          // } 
        })
      }
    })
  },
  onShareAppMessage(){
    return {
      title:"日和海淘"
    }
  }, 
  onShow: function () {
    // this.getCatesStorage()
    db.collection('catesDetails').get({
      success:res1=>{
        this.setData({
          categories:res1.data,
        })
      }
    })
  },
  getCatesStorage() {
    // 1 获取本地存储中的数据 （小程序中页存在本地存储技术）    
    const Cates = wx.getStorageSync("cates");
    // 2 开始做判断
    if (!Cates) {
      //不存在 发送请求
      db.collection('catesDetails').get({
        success: res => {
          console.log(res)
          this.setData({
            categories:Cates.data,
          })
          this.Cates = res.data
          //把接口的数据存入到本地存储中
          wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });
        }
      })
    } 
    this.setData({
      categories:Cates.data,
    })
  },
  onLoad(){
    this.page = 0
    this.getList(true)
    // this.getTops()
    this.getNotice()
    this.getCatesStorage()
    wx.showShareMenu()

    wx.showLoading({
      title:'加载中',
    })
    // limit(4)设置首次加载上限
    // db.collection('rhnewbee').limit(20).get({
    //   success:res=>{
    //     this.setData({
    //       list: res.data
    //     })
    //     wx.hideLoading()
    //   }
    // })
    // this.getNotice()
    
  }
})
