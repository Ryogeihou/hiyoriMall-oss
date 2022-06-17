// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	try {
		const pidUid = event.rhid +'_'+event.userId;
		const qrTempPath = 'user_poster/'+ pidUid + '.jpg';
		const qrCodeResult = await cloud.openapi.wxacode.getUnlimited({
			scene: pidUid,
        	page:'pages/detail/detail',
    	    isHyaline:true
		  })
		const uploadResult = await cloud.uploadFile({
			cloudPath: qrTempPath,
			fileContent: qrCodeResult.buffer
		})
		const tempFileURL = await cloud.getTempFileURL({
			fileList: [uploadResult.fileID]
		})
		return tempFileURL
	  } catch (err) {
		return err
	  }
}