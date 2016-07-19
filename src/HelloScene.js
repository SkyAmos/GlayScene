//游戏接入的Demo
/**
*开发者 Amos
*/
var  functionLayer = cc.Layer.extend({
	userList:null,
	gameMenu:null,
	loginMenu:null,
	entryMenu:null,

	ctor:function() {
		cc.log("ctor of Layer");
		this._super();

		var size = cc.director.getWinSize();   //获取屏幕尺寸

		var label = new cc.LabelTTF("功能列表"，"Arial", 28);
		//lable.setPosition( size.width/2, size.height/2 + 200);
		label.x = size.width / 2;
		label.y = size.height / 2 + 200;
		this.addChild(label);

		//添加loginMenu
		var loginItemList = [];

		var loginLabel = new cc.LabelTTF("使用 SkyDragonSDK 登录", "Arial", 38);
		var loginItem = new cc.MenuItemLabel(loginLabel, this.gplayLogin, this);
		loginItemList.push(loginItem);

		//模拟器跳过登录界面自动登录，主要用于前期检查游戏是否能正常跑在runtime上
		var simLoginLabel = new cc.LabelTTF("跳过登录"， "Arial", 38);
		var simLoginItem = new cc.MenuItemLabel(simLoginLabel, this.showGameEntry, this);
		loginItemList.push(simLoginItem);

		var exitLabel = new cc.LabelTTF("退出游戏", "Arial", 38);
		var exitItem = new cc.MenuItemLabel( exitLabel, this.exitGame, this);
		loginItemList.push(exitItem);

		cc.eventManager.addListener({
			event: cc.EventListener.KEYBOARD,
			onKeyReleased: function(keyCode, event){
				if (keycode == cc.KEY.back) {
					gplay.quitGame();
				}
			}
		}, this)

		this.loginMenu = new cc.Menu(loginItemList);
		this.loginMenu = new setPosition(size.width / 2, size.height / 2);
		this.loginMenu.alignItemsVerticallWithPadding(10);
		this.loginMenu.setTag(MenuTag.LOGIN_MENU);
		this.addChild(this.loginMenu);


		//添加 entryMenu
		var entryItemList = [];

		var entryLabel = new cc.LabelTTF("进入游戏", "Arial", 38)
		var entryItem = new cc.MenuItemLabel( entryLabel, function(){
			cc.director.pushScene(new sceneMain());         //推送该场景
		},this );
		entryItemList.push(entryItem);

		var logoutLabel = new cc.LabelTTF("退出登录"， "Arial", 38);
		var logoutItem = new cc.MenuItemLabel(logoutLabel, this.logout, this);
		entryItemList.push(logoutItem);

		this.entryMenu = new cc.Menu(entryItemList);
		this.entryMenu.setPosition(size.width * 3/4, size.height * 3/4);
		this.entryMenu.alignItemsVerticallWithPadding(10);
		this.entryMenu.setTag(MenuTag.GAME_ENTRY_MENU);
		this.addChild(this.entryMenu);

		this.loginMenu.setVisible(false);
		this.entryMenu.setVisible(false);

		if (gplay.isInGplayEnv) {
			gplay.initSDK("gplaydemo", "gplaydemo", "gplaydemo");
			if (gplay.isLogined())
				this.showGameEntry();
			else
				this.showLoginMenu();
		} else {
			cc.log("not in gplay");
		},


		//添加 gameMenu
		var functionList = [];

		var payLabel = new cc.LabelTTF("支付功能", "Arial", 30);
		var payItem = new cc.MenuItemLabel( payLabel, this.pay, this);
		functionList.push(payItem);

		var shareLabel = new cc.LabelTTF("分享给好友", "Arial", 30);
		var shareItem = new cc.MenuItemLabel(shareLabel, this.share, this);
		functionList.push(shareItem);

		var deskLabel = new cc.LabelTTF("发送桌面快捷方式", "Arial", 30);
		var deskItem = new cc.MenuItemLabel(deskLabel, this.send2Desk, this);
		functionList.push(deskItem);

		var backLabel = new cc.LabelTTF("返回登录框", "Arial", 30);
		var backItem = new cc.MenuItemLabel(backLabel, this.back, this);
		functionList.push(backItem);

		this.gameMenu = new cc.Menu(functionList);
		this.gameMenu.setPosition(size.width/2, size.height/2);
		this.gameMenu.alignItemsVerticallWithPadding(10);
		this.addChild(this.gameMenu);
		this.gameMenu.setVisible(true);
		return true;
	},


	showLoginMenu: function() {
		cc.log("show login menu");
		var authorName = gplaySyncFunc("getAuthorName", '{"fakeParams":0}');
		cc.log("authorName is:" + authorName);
		this.loginMenu.setVisible(true);
		this.entryMenu.setVisible(true);
	},

	showGameEntry: function(){
		cc.log("show game entry");
		this.loginMenu.setVisible(false);
		this.entryMenu.setVisible(true);
	},

	gplayLogin: function() {
		cc.log("gplay login");
		gplay.login(this.loginCallback.bind(this));
	},

	logout: function(sender) {
		cc.log("logout...");
		if(gplay.isSupportingFunc("logout")) {
			gplay.logout(this.loginCallback.bind(this));
			//this.callAsyncFunc("logout", null, this.loginCallback.bind(this));
		} else {
			cc.log("no, this channel doesn't support logout");
		}
	},

	loginCallback: function(code, msg){
		cc.log("on user result action.");
		cc.log("code:" + code);
		cc.log("msg:" + msg);

		switch(code){
			case gplay.ActionResultCode.USER_RESULT_NETWORK_ERROR:
				cc.log("网络错误");
				break;
			case gplay.ActionResultCode.USER_LOGIN_RESULT_SUCCESS;
				cc.log("登录成功");

				//登录完成，保存用户信息
				cc.sys.localStorage.setItem("userInfo", msg);
				this.showGameEntry();
				break;
			case gplay.ActionResultCode.USER_LOGIN_RESULT_FAIL:
				cc.log("登录失败");
				break;
			case gplay.ActionResultCode.USER_LOGOUT_RESULT_SUCCESS:
				cc.log("注销成功");
				this.showLoginMenu();
				break;
			case gplay.ActionResultCode.USER_LOGOUT_RESULT_FAIL:
				cc.log("注销失败");
				this.showGameEntry();
				break;
			default: 
				cc.log("未知返回码:" + code);
		}
	},

	pay: function() {
		cc.log("pay...");

		var params = new GplayPayParams();
		params.setProductID("2048");					  	//商品ID
		params.setProductName("gold");						//商品名称
		params.setProductPrice(1);							//商品单价 number类型
		params.setProductCount(1);							//商品数量 number类型
		params.setProductDescription("2048号物品，gold");	//商品描述
		params.setGameUserID("stevejokesid");				//玩家ID
        params.setGameUserName("stevejokes");				//玩家昵称
        params.setServerID("skybigid");						//服务器ID
        params.setServerName("skybig");						//服务器名称
        // params.setExtraData('{"key1":"value1", "key2":"value2"}');// 扩展参数，默认为空

        gplay.pay(params, function (ret, msg){
        	switch(ret){
        		case gplay.ActionResultCode.PAY_RESULT_SUCCESS:
        			cc.log("支付成功")；
        			break;
        		case gplay.ActionResultCode.PAY_RESULT_FAIL:
        			cc.log("支付失败");
        			break;
        		case gplay.ActionResultCode.PAY_RESULT_CANCEL:
        			cc.log("支付取消");
        			break;
        		case gplay.ActionResultCode.PAY_RESULT_INVALID:
        			cc.log("参数非法");
        			break;
        		case gplay.ActionResultCode.PAY_RESULT_PAYING:
        			cc.log("正在支付...");
        			break;
        	}
        }.bind(this));
	},

	share: function(){
		cc.log("share");

		var params = new GplayShareParams();
		params.setPageUrl("http://192.168.1.3");                               //分享页面
        params.setTitle("JSUnitSDKDemo");									   //分享内容
        params.setText("JSUnitSDKDemo 是 Gplay 统一 SDK 的线下测试版本");      //分享内容
        params.setImgUrl("http://192.168.1.3:8888/moon/icon/large_icon.png");  //分享图片
        params.setImgTitle("large_icon");									   //分享图片标题

        gplay.share(params, this.shareCallback.bind(this));
	},

	shareCallback: function(retCode, msg) {
		cc.log("share result code:" +retCode+ ", msg:" + msg);

		switch (retCode) {
			case gplay.ActionResultCode.SHARE_RESULT_SUCCESS:
				cc.log("分享成功");
				break;
			case gplay.ActionResultCode.SHARE_RESULT_FAIL:
				cc.log("分享失败");
				break;
			case gplay.ActionResultCode.SHARE_RESULT_CANCEL:
				cc.log("分享取消");
				break;
			case gplay.ActionResultCode.SHARE_RESULT_NETWORK_ERROR:
				cc.log("分享网络错误");
				break;
			default:
				cc.log("未知返回码:" + retCode);
				break;
		}
	},

	send2Desk: function(){
		cc.log("send2Desk...");

		gplay.createShortcut(function (retCode, msg){
			cc.log("send2DeskCallback result code:" + retCode+ ", msg" + msg);

			switch (retCode){
				case gplay.ActionResultCode.SHORTCUT_RESULT_SUCCESS:
					cc.log("发送方桌面快捷方式成功");
					break;
				case gplay.ActionResultCode.SHORTCUT_RESULT_FAILED:
					cc.log("发送桌面快捷方式失败");
					break;
				default:
					cc.log("未知返回码"+ retCode + ", msg" + msg);
					break;
			}
		}.bind(this));
	},

	back: function() {
		cc.log("back...");
		cc.director.popScene();
	},

	exitGame: function(){
		cc.log("gplay quitGame");
		gplay.quitGame();
	}

});


var sceneMain = cc.Scene.extend({
	onEnter:function(){
		this._super();
		var layer = new functionLayer();
		this.addChild(layer);
	}
});