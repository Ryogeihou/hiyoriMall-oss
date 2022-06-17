import regeneratorRuntime from'../../lib/runtime/runtime';

const db =wx.cloud.database()
Page({
  data: {
    //左侧菜单数据
    leftMenuList:[],
    //右侧的商品数据
    rightContent:[],
    //被点击的左侧菜单
    currentIndex:0,
    //右侧内容的滚动条距离顶部的距离
    scrollTop:0
  },
  //接口的返回数据
  Cates:[],
  
  onLoad:function(options){
     // 1 获取本地存储中的数据 （小程序中页存在本地存储技术）缓存
    this.getStorage()
  },
  // 判断缓存
   getStorage(){
    const Cates =  wx.getStorageSync("cates");
    // 2 开始做判断
    if(!Cates){
      //不存在 发送请
      this.getCates();
    }else{
      //有旧的数据 定义过期时间 10s  改成 5min
      if(Date.now()-Cates.time>1000*300){
        //重新发送请求
        this.getCates();
      }else{
        //可以使用旧数据
        this.Cates=Cates.data;
            //构造左侧的大菜单数据
            let leftMenuList=this.Cates.map(v=>v.cat_name);
            //构造右侧商品数据
            let rightContent=this.Cates[0].children;
            this.setData({
              leftMenuList,
              rightContent
            })
       }
    }
  },
  //获取分类数据
  async getCates(){
    wx.showLoading({
      title:'加载中',
    })
    await db.collection('catesDetails').where({

    }).get({
      success:res=>{
        // console.log(res)
        this.Cates=res.data
        // this.setData({
        //   list: res.data
        // })
        //把接口的数据存入到本地存储中 缓存 
        wx.setStorageSync("cates",{time:Date.now(),data:this.Cates});
        let leftMenuList=this.Cates.map(v=>v.cat_name);
        //构造右侧商品数据
        let rightContent=this.Cates[0].children;
        // rightContent.children.slice(1,length-1);
        // console.log(rightContent[0].slice(1,length-1));
        this.setData({
          leftMenuList,
          rightContent
        })
        wx.hideLoading()
      }
    })
  },
  //左侧菜单的点击事件
  handleItemTap(e){
    /*
    1. 获取被点击的标题身上的索引
    2. 给data中的currentIndex赋值
    3. 根据不同的索引来渲染右侧的内容
    */
    const{index}=e.currentTarget.dataset;

    let rightContent=this.Cates[index].children;
    this.setData({
      currentIndex:index,
      //重新设置 右侧内容的scroll-view标签的顶部距离
      rightContent,
      scrollTop:0
    })

  }
})




