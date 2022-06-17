const db = wx.cloud.database()
import regeneratorRuntime from'../../lib/runtime/runtime';

Page({

  data: {
    goodsList:[],
    isFocus:false,
    inputValue:""
  },
  TimeId:-1,
  handleInput(e){
    const{value}=e.detail;
    console.log(value)
    // 1 获取输入框值
    // console.log(value)
    // 2 检查合法性
    if(!value.trim()){
      this.setData({
        goodsList:[],
        isFocus:false
      })
      return;
    }
    // 3 准备发送请求
    this.setData({
      isFocus:true
    })
    if(value==''){
      return
    }else{
      clearTimeout(this.TimeId);
      this.TimeId=setTimeout(()=>{
        if(value==''){
          this.handleCancel()
        }else{
          this.inputSearch(value);
        }
      },1000)
    }

  },
  inputSearch(inputValue){
    // const a = '/'+ inputValue + '/'
    db.collection('rhnewbee').where( 
  {'selling': true},
  {'title':db.RegExp({
    regexp: inputValue,
    options: 'i',
  })},
  {'subHead':db.RegExp({
    regexp: inputValue,
    options: 'i'
  })},
 )
  .get({  
    success:res=>{
      console.log(res)
      this.setData({
        goodsList:res.data
      })  
    }
  })
  },
  toDetail(e){
    const id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
    console.log(e)
  },
  handleCancel(){
    this.setData({
      inputValue:"",
      isFocus:false,
      goodsList:[]
    })
  }

})