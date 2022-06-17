// pages/brand/brand.js
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand: {},
    list: [],
    folded: false,
    isBrandInfoUnfold: false,
    isCollect: false,
    brandId: 0,
    userInfo: {},
    brandList: []
  },
  // 折叠
  handleFold () {
    this.setData({
      folded: !this.data.folded,
      isBrandInfoUnfold: !this.data.isBrandInfoUnfold
    })
  },

  onLoad (options) {
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ userInfo })
    this.page = 0
    this.getBrandGoodsList(true, options.id)
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options
    const brandId = Number(options.id);
    this.setData({
      brandId
    })
    this.getBrandDetail(brandId)
    wx.hideLoading()
  },

  getBrandDetail (id) {
    // 判断商品是否被收藏
    let collect = wx.getStorageSync("userInfo").brandCollection || [];
    let isCollect = collect.some(function (value) {
      return value.brandId == id
    })
    // 数据库调用商品信息
    const ins = db.collection('brand').where({ 'brandId': id })
    // ins.update({
    //   data: {
    //     count: db.command.inc(1)
    //   }
    // })
    ins.field({
      bgpic: true,
      title: true,
      onSale: true,
      logo: true,
      intro: true,
      homePage: true,
      brandId: true,
      slogan: true
    }).get({
      success: res => {
        this.setData({
          brand: res.data[0],
          isCollect
        })
      }
    });
  },
  handleCollect () {
    if (!this.isLogin()) return
    var brandId = Number(this.data.brandId)
    let isCollect = false;
    // 1 获取缓存中的商品收藏数组
    let userInfo = wx.getStorageSync("userInfo") || [];
    let collect = userInfo.brandCollection || [];
    // 2 判断商品是否被收藏过
    let index = collect.findIndex(v => v.brandId === brandId)
    // 3 当index！==-1表示已经收藏过
    if (index !== -1) {
      // 能找到 已收藏 在数组中删除该商品
      collect.splice(index, 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
    } else {
      // 未收藏
      var brand = this.data.brand

      let briefBrandInfo = {
        "brandId": brand.brandId,
        "logo": brand.logo,
        "slogan": brand.slogan,// 无图报错
        "title": brand.title,
      };
      userInfo.brandCollection.push(briefBrandInfo);
      isCollect = true;
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
    // 4 把数组存入缓存
    // console.log(userInfo)
    // 5 修改data中的属性
    db.collection('userInfo').where({ '_openid': userInfo.openId }).update({
      data: {
        brandCollection: userInfo.brandCollection
      }
    })
    wx.setStorageSync("userInfo", userInfo)
    this.setData({
      isCollect
    })
    // 同步数据库 待优化 暂时把简化后商品信息存入DB 希望DB只保存rhid
    // const ins = db.collection('userInfo')
    //   .where({ '_openid': userInfo._openid })
    // ins.update({
    //   data: {
    //     'collection': collect
    //   }
    // })
  },
  isLogin (e) {
    if (wx.getStorageSync("userInfo")) {
      console.log(wx.getStorageSync("userInfo"));
      return true
    } else {
      wx.redirectTo({
        url: '../login/login?' + 'path=/pages/brand/brand&id=' + this.data.brandId
          + '&type=' + e.currentTarget.id
      })
    }
  },
  getBrandGoodsList (isInit, cid) {
    cid = Number(cid)
    const PAGE = 16
    wx.showLoading({
      title: '加载中',
    })
    const res = db.collection("rhnewbee").where({
      brandId: cid
    }).skip(this.page * PAGE).limit(PAGE).get({
      success: res => {
        console.log(res)
        if (res != []) {
          // console.log('触底刷新', res.data)
          if (isInit) {
            this.setData({
              brandList: res.data
            })
            console.log(this.data.brandList)
          } else {
            //下拉刷新，不能直接覆盖而是累加
            this.setData({
              goodsList: this.data.goodsList.concat(res.data)
            })
            wx.stopPullDownRefresh()
          }
          wx.hideLoading()
        }
      }
    })
  },
})