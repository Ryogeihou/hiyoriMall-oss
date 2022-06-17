// pages/detail/detail.js
import regeneratorRuntime from '../../lib/runtime/runtime';
import Poster from '../../miniprogram_dist/poster/poster';

const db = wx.cloud.database() //获取数据库实例
const app = getApp()
const posterConfig = {}
// }
Page({
  data: {
    id: 0,
    info: {},
    carts: [],
    introduce: [],
    isCollect: false,
    // posterConfig: posterConfig.jdConfig,
    qrcode: [],
    isMember: false,
    userInfo: {},
    // membPrice:55
  },

  onLoad (query) {
    // scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    // const scene = decodeURIComponent(query.scene)    
    if (query && query.scene) {
      const scene = decodeURIComponent(query.scene) // 处理扫码进商品详情页面的逻辑
      console.log("scene:", scene)
      console.log(scene.split('_'))
      if (scene && scene.split('_').length >= 2) {
        query.id = scene.split('_')[0]
        const referrer = Number(scene.split('_')[1])
        wx.setStorageSync('referrer', referrer)
        console.log("上级ID:", scene.split('_')[1])
      }
    }
    this.data.id = query.id
    this.getGoodsDetail(this.data.id)
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ userInfo })

  },
  onPullDownRefresh () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },
  async getGoodsDetail (id) {
    // 判断商品是否被收藏
    // console.log(id)

    let collect = wx.getStorageSync("userInfo").collection || [];
    let isCollect = collect.some(function (value) {
      return value.rhid == id
    })
    // 数据库调用商品信息
    const ins = await db.collection('rhnewbee').where({
      'rhid': Number(id)
    })
    ins.update({
      data: {
        count: db.command.inc(1)
      }
    })
    ins.field({
      "_id": true,
      "price": true,
      "title": true,
      "pics": true,
      "subHead": true,
      "introduce": true,
      "rhid": true,
      "vipPrice": true
    }).get({
      success: res => {
        this.setData({
          info: res.data[0],
          isCollect
        })
      }
    });
  },
  handleLike (e) {
    if (!this.isLogin(e)) return
    this.setData({
      isCollect: !this.data.isCollect,
      userInfo: wx.getStorageSync('userInfo')
    })
    //Todo
    if (this.data.isCollect) {
      db.collection('like').add({
        data: {
          createdTime: Date.now(),
          userId: this.data.userInfo.userId,
          referrer: this.data.userInfo.referrer,
          rhid: this.data.info.rhid,
          title: this.data.info.title,
          price: this.data.info.vipPrice,
          gainPoint: (this.data.info.vipPrice * 0.1).toFixed(2)
        }
      }).then(res => {
        if (res.errMsg == 'collection.add:ok') {
          db.collection('userInfo').where({
            userId: this.data.userInfo.referrer
          }).update({
            data: {
              point: db.command.inc(Number((this.data.info.vipPrice * 0.1).toFixed(2)))
            }
          }).then(res => {
            if (res.errMsg == 'collection.update:ok') {
              wx.showToast({
                title: 'いいねしました！',
                icon: 'success',
                mask: true
              })
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '取り消しました！',
        icon: 'success',
        mask: true
      })
    }
  },
  //点击商品收藏
  handleCollect (e) {
    if (!this.isLogin(e)) return
    let id = Number(this.data.id)
    let isCollect = false;
    // 1 获取缓存中的商品收藏数组
    // console.log('id',id)
    let userInfo = wx.getStorageSync("userInfo") || [];
    let collect = userInfo.collection || [];
    // 2 判断商品是否被收藏过
    let index = collect.findIndex(v => v.rhid === id)
    // let isCollect = userInfo.collection.some(function (value) {
    //   return value == id
    // });
    // console.log(index,id)

    // 3 当index！==-1表示已经收藏过
    if (index !== -1) {
      // 能找到 已收藏 在数组中删除该商品
      collect.splice(index, 1);
      this.isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    } else {
      // 未收藏
      var info = this.data.info
      // console.log(this.data.info.pics)
      const pics = this.data.info.pics ? this.data.info.pics[0] : []
      let briefGoodsInfo = {
        "price": info.price,
        "title": info.title,
        "pics": pics,
        "subHead": info.subHead,
        "rhid": info.rhid
      };
      collect.push(briefGoodsInfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    console.log(userInfo)
    db.collection('userInfo').where({ '_openid': userInfo.openId }).update({
      data: {
        collection: userInfo.collection
      }
    })
    // 4 把数组存入缓存
    wx.setStorageSync("userInfo", userInfo);
    // console.log(userInfo)
    // 5 修改data中的属性
    this.setData({
      isCollect
    })
    // 同步数据库 待优化 暂时把简化后商品信息存入DB 希望DB只保存rhid
    // const ins = db.collection('userInfo')
    //   .where({
    //     '_openid': userInfo._openid
    //   })
    // ins.update({
    //   data: {
    //     'collection': collect
    //   }
    // })
  },
  isLogin (e) {
    if (wx.getStorageSync("userInfo")) {
      return true
    } else {
      wx.redirectTo({
        url: '../login/login?' + 'path=/pages/detail/detail&id=' + this.data.info.rhid
          + '&type=' + e.currentTarget.id
      })
      wx.showToast({
        title: 'Please login',
        icon: 'loading',
        mask: true
      })
    }
  },



  //点击加入购物车
  handleCartAdd (e) {
    // let info=this.info
    // console.log(e.currentTarget)
    // console.log("dataset",e.currentTarget,"\noptions",this.options,"\nlist",info)
    const {
      item
    } = e.currentTarget.dataset //小程序里传递数据的一个方法
    const i = app.globalData.carts.findIndex(v => v._id == item._id)
    if (i > -1) {
      // 已经存在，数量加一
      app.globalData.carts[i].num += 1
    } else {
      item.num = 1
      item.checked = true
      app.globalData.carts.push(item)
    }
    // app.setTabbar()
    wx.showToast({
      title: '加入成功',
      icon: 'succes',
      //防止手抖
      // mask: true
    });
  },
  async getQR (e) {
    if (!this.isLogin(e)) return

    const _this = this
    const qrcodeRes = await wx.cloud.callFunction({
      name: 'getCode',
      data: {
        rhid: e.currentTarget.id,
        userId: this.data.userInfo.userId
      },
    })
    const qrcode = qrcodeRes.result.fileList[0].tempFileURL
    const pic = this.data.info.pics[0]

    wx.getImageInfo({
      src: pic,
      success (res) {
        const height = 490 * res.height / res.width
        _this.drawSharePicDone(height, qrcode)
      },
      fail (e) {
        console.error(e)
      }
    })
  },

  drawSharePicDone (picHeight, qrcode) {
    // const _this = this
    const _baseHeight = 74 + (picHeight + 120)
    this.setData({
      posterConfig: {
        width: 750,
        height: picHeight + 660,
        backgroundColor: '#fff',
        debug: false,
        blocks: [
          {
            x: 76,
            y: 74,
            width: 604,
            height: picHeight + 120,
            borderWidth: 2,
            borderColor: '#c2aa85',
            borderRadius: 8
          }
        ],
        images: [
          {
            x: 133,
            y: 133,
            // url: "https://7268-rhtest-xncrn-1301029421.tcb.qcloud.la/pics/" + this.data.info.rhid + ".png",
            url: this.data.info.pics[0],
            width: 490,
            height: picHeight
          },
          {
            x: 76,
            y: _baseHeight + 199,
            url: qrcode, // 二维码
            width: 222,
            height: 222
          }
        ],
        texts: [
          {
            x: 375,
            y: _baseHeight + 80,
            width: 650,
            lineNum: 2,
            text: this.data.info.title,//标题
            textAlign: 'center',
            fontSize: 40,
            color: '#333'
          },
          {
            x: 75,
            y: _baseHeight + 180,
            text: '￥' + this.data.info.price,//价格
            textAlign: 'center',
            fontSize: 50,
            color: '#e64340'
          },
          {
            x: 352,
            y: _baseHeight + 320,
            text: '长按识别小程序码',
            fontSize: 28,
            color: '#999'
          }
        ],
      }
    }, () => {
      Poster.create();
    });
  },

  toNavigateTo () {
    wx.navigateTo({
      url: '/pages/goods_code/goods_code?id=' + this.data.id + '&qrcode=' + this.data.qrcode + '&itempic=' + this.data.info.pics[0],
    })
  },
  onPosterSuccess (e) {
    // console.log('success:', e)
    this.setData({
      posterImg: e.detail,
      showposterImg: true
    })
  },
  // onPosterSuccess(e) {
  //   const {
  //     detail
  //   } = e;
  //   wx.previewImage({
  //     current: detail,
  //     urls: [detail]
  //   })
  // },
  // onPosterFail(err) {
  //   console.error(err);
  // },
  onPosterFail (e) {
    console.error('fail:', e)
  },
  savePosterPic () {
    const _this = this
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImg,
      success: (res) => {
        wx.showModal({
          content: '已保存到手机相册',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#333'
        })
      },
      complete: () => {
        _this.setData({
          showposterImg: false
        })
      },
      fail: (res) => {
        console.log(res)
        if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          console.log("打开设置窗口");
          wx.openSetting({
            success (settingdata) {
              console.log(settingdata)
              if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                console.log("获取权限成功，再次点击图片保存到相册")
              } else {
                console.log("获取权限失败")
              }
            }
          })
        }
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  qqq () {
    this.setData({
      showposterImg: false
    })
  },
  onCreatePoster () {
    this.setData({
      posterConfig: posterConfig.demoConfig
    }, () => {
      Poster.create(true); // 入参：true为抹掉重新生成
    });
  },

  onCreateOtherPoster () {
    this.setData({
      posterConfig: posterConfig.jdConfig
    }, () => {
      Poster.create(true); // 入参：true为抹掉重新生成 
    });
  },
  onShow: function () {

  }
  // 点击轮播图 放大预览
  // handlePrevewImage(){
  //   const urls = GoodsInfo.pics.map(v=>v.pics);
  //   wx.wx.previewImage({
  //     current: urls[0],
  //     urls: urls,
  //   });
  // },
  //   addCart(e){
  //     const {item} = e.currentTarget.dataset //小程序里传递数据的一个方法
  //     const i = app.globalData.carts.findIndex(v=>v._id==info._id)
  //     if(i>-1){
  //       // 已经存在，数量加一
  //       app.globalData.carts[i].num += 1
  //     }else{
  //       item.num = 1
  //       app.globalData.carts.push(item)
  //     }
  //     app.setTabbar()
  //     wx.showToast({
  //       title: '加入成功',
  //       icon: 'succes',
  //       //防止手抖
  //       mask: true
  //     });
  //   },

})
