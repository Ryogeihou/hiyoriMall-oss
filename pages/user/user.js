// pages/my/my.js
Page({
  data: {
    userInfo: {},
    collectionNums: 0,
    brandcollectNums: 0
  },
  onLoad:function (options) {
    // // const userInfo = wx.getStorageSync("userInfo");
    // // const userInfo = wx.getStorageSync("userInfo") || [];
    // console.log(userInfo,Object.keys(userInfo))
    // // if (Object.keys(userInfo)!== []) {
    // if (userInfo.nickname !== "") {
    //   // const collect = userInfo.collection;
    //   // const brandCollection = userInfo.brandCollection
    //   this.setData({
    //     userInfo,
    //     // collectionNums: collect.length,
    //     // brandcollectNums: brandCollection.length
    //   })
    // }
  },
  onShow(){
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({userInfo})
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
    console.log(qrcodeRes)
    const qrcode = qrcodeRes.result.fileList[0].tempFileURL
    const pic = this.data.info.pics[0]
    // const pic = "/images/notice.png"
    console.log("qrURL", qrcode, pic)
    // 设置图片高度
    wx.getImageInfo({
      src: pic,
      success (res) {
        const height = 490 * res.height / res.width
        //传值画图
        // console.log(height)
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

})