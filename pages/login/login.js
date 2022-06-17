import regeneratorRuntime from '../../lib/runtime/runtime';
// pages/login/login.js
// wx.cloud.init()
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    userInfo: {},
    dataForm: {},
    //until Feb 2022
    memberLevel: 1
  },
  queryDB (userInfo, newUid, newReferrer) {
    console.log(userInfo)
    db.collection('userInfo').where({ '_openid': userInfo.openId }).get({
      success: res => {
        // console.log(res.data[0]._id.length)
        if (res.data.length == 0) {
          // console.log('不存在')
          // 新用户
          // console.log(userInfo);
          userInfo.userId = newUid
          userInfo.referrer = newReferrer
          userInfo.createdTime = Date.now()
          userInfo.collection = [],
          userInfo.brandCollection = [],
          userInfo.point = 0
          db.collection('userInfo').add({
            data: {
              avatarUrl: userInfo.avatarUrl,
              city: userInfo.city,
              country: userInfo.country,
              gender: userInfo.gender,
              nickName: userInfo.nickName,
              _openid: userInfo.openId,
              province: userInfo.province,
              referrer: userInfo.referrer,
              userId: userInfo.userId,
              memberLevel: this.data.memberLevel,
              createdTime: userInfo.createdTime,
              collection: userInfo.collection,
              brandCollection: userInfo.brandCollection
            }
          })
          wx.setStorageSync("userInfo", userInfo)
          return userInfo

        } else {
          db.collection('userInfo').where({ '_openid': userInfo.openId })
            .update({
              data: {
                avatarUrl: userInfo.avatarUrl,
                city: userInfo.city,
                country: userInfo.country,
                gender: userInfo.gender,
                nickName: userInfo.nickName,
                province: userInfo.province,
                lastLogin: Date.now()
              }
            })
          wx.setStorageSync("userInfo", res.data[0]);
          return userInfo
        }
      }
    })
  },

  async getUserProfile(e) {
    
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        })
        this.getUserInfo (res)
      }
    })
    // console.log(this.data.userInfo)
  },
  async getUserInfo (res) {
    console.log(res)
    const newReferrer = wx.getStorageSync("referrer") || 0
    let userInfo = res.userInfo
    // this.data.userInfo = e.detail.userInfo

    const newUid = await db.collection('userInfo').count()
    wx.showLoading({
      title: '从此更多精彩',
    })
    wx.cloud.callFunction({
      name: 'login',
      success: async res => {
        userInfo.openId = res.result.wxInfo.OPENID
        // app.globalData.userInfo = e.detail.userInfo 
        await this.queryDB(userInfo, newUid.total + 1, newReferrer)
        this.turnBack(this.data.dataForm.path, this.data.dataForm.id)
      }
    })
  },
  turnBack (path, id) {
    // console.log(id)
    if (id == undefined) {
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 800)
      return
    }
    //TODO more smart
    setTimeout(function () {
      wx.redirectTo({
        url: path + '?id=' + id
      })
    }, 800)
  },
  onLoad: function (query) {
    console.log(query);
    this.setData({
      dataForm: query
    })
  },


  getUserInfoOld: function (e) {

    if (wx.getStorageSync("userInfo") == []) {
      // 1 内存空的情况下请求服务器获取openid
      console.log("内存无数据")
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          app.globalData.userInfo = e.detail.userInfo
          e.detail.userInfo.openid = res.result.wxInfo.OPENID
          const userInfo = e.detail.userInfo
          console.log(res)
          // 2 此处调用函数判断
          this.setDataBase(userInfo)
          this.turnBack(this.data.dataForm.path, this.data.dataForm.id)
        }
      })
    } else {
      console.log("内存有数据")
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log(res)
          console.log(e)
        }
      })
      //Todo 更新缓存
      this.turnBack(this.data.dataForm.path, this.data.dataForm.id)
    }
    // console.log(this.data.dataForm.path, this.data.dataForm.id)
  },
  async setDataBase (userInfo) {
    console.log(userInfo)
    const userDBInfo = db.collection('userInfo')
    const uid = await userDBInfo.count()
    // const referrer =
    console.log(uid.total + 1)
    userDBInfo.where({ '_openid': userInfo.openid }).get({
      success: res => {
        console.log('', res)
        if (res.data.length !== 0) {
          console.log('不存在')
          // 新用户
          userInfo.userId = uid.total + 1
          userDBInfo.add({
            data: {

            }
          })
          wx.setStorageSync("userInfo", userInfo);

        } else {
          // 用户已存在 将获取的信息存入缓存
          wx.setStorageSync("userInfo", res.data[0]);
        }
      }
    })
  },
  // //弃用
  // handleGetUserInfo(e) {
  //   // console.log(e)
  //   const { userInfo } = e.detail;
  //   if (wx.getStorageSync("userInfo") == []) {
  //     db.collection('userInfo').add({
  //       data: {
  //         country: e.detail.userInfo.country,
  //         gender: e.detail.userInfo.gender,
  //         nickName: e.detail.userInfo.nickName,
  //         // _openid: e.detail.userInfo.openid
  //       }
  //     })
  //   } else {
  //     // console.log('缓存中存在')
  //     wx.navigateBack({
  //       delta: 1
  //     });
  //   }
  //   wx.setStorageSync("userInfo", userInfo);
  //   wx.navigateBack({
  //     delta: 1
  //   });
  //   // this.getUserInfo()

  // },

})
