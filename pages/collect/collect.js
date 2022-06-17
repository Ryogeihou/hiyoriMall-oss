import regeneratorRuntime from '../../lib/runtime/runtime';
// pages/collect/collect.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    collect: [],
    brand:[],
    tabs: [
      {
        id: 0,
        value: "品牌",
        isActive: true
      },
      {
        id: 1,
        value: "商品",
        isActive: false
      },
      {
        id: 2,
        value: "文章",
        isActive: false
      },
      {
        id: 3,
        value: "浏览足迹",
        isActive: false
      }
    ]
  },
  onShow() {
    // 获取传入索引
    let pages = getCurrentPages();
    // console.log(pages)
    let currentPage = pages[pages.length - 1];
    const { type } = currentPage.options;
    this.changeTitleByIndex(type - 1);
    // 获取储存数据
    const collect = wx.getStorageSync("userInfo").collection || [];
    const brand = wx.getStorageSync("userInfo").brandCollection || [];
    this.setData({
      collect,
      brand
    });

  },
  changeTitleByIndex(index) {
    // 2 修改源数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    // 3 赋值到data中
    this.setData({
      tabs
    })
  },
  handleTabsItemChange(e) {
    // 1 获取被点击的标题索引
    const { index } = e.detail;
    this.changeTitleByIndex(index);
  },
  // 预留
  checkStorage() {
    const Cates = wx.getStorageSync("cates");
    // 2 开始做判断
    if (!Cates) {
      //不存在 发送请求
      this.getCates();
    } else {
      //有旧的数据 定义过期时间 10s  改成 5min
      if (Date.now() - Cates.time > 1000 * 300) {
        //重新发送请求
        this.getCates();
      } else {
        //可以使用旧数据
        this.Cates = Cates.data;
        //构造左侧的大菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        //构造右侧商品数据
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  }
})