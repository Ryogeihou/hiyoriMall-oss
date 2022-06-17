// pages/captain/captain.js
const app = getApp()
const db = wx.cloud.database()
Page({

	data: {
		memberList:[],
		memberTotal:0,
		likeList:[],
		likeTotal: 0,
		nowPoint:0
	},


	onLoad: function (options) {
		let uid = Number(options.userId)
		db.collection("userInfo").where({
			userId: uid
		}).get({
			success: res =>{
				console.log(res);
				this.setData({
					nowPoint: res.data[0].point.toFixed(2)
				})
			}
		})
		db.collection("userInfo").where({
			referrer: uid
		}).get({
			success: (res)=>{
				let melist = res.data
				melist.map(item =>{
				    item.createdTime = this.timeToString(item.createdTime);
					})
				this.setData({
					memberList: melist,
					memberTotal:res.data.length
				})
				
			}
		})
	
		db.collection("like").where({
			referrer: Number(options.userId)
		}).get({
			success: res =>{
				let likeList = res.data
				likeList .map(item =>{
				    item.createdTime = this.timeToString(item.createdTime);
					})
				this.setData({
					likeList: likeList,
					likeTotal:res.data.length
				})
			}
		})
	},

	timeToString (time) {
		let date = new Date(time);
		let Y = date.getFullYear() + '-';
		let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
		let D = date.getDate() + ' ';
		let h = date.getHours() + ':';
		let m = date.getMinutes() + ':';
		let s = date.getSeconds(); 
		return Y+M+D+h+m+s
	}
})